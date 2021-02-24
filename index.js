#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { soundboardCompiler } from './src/compiler.js';
import { LEGAL_TOP_LEVEL_KEYS } from './src/consts.js';
import './src/register-globals.js';

function panic(...args) {
  console.error(...args);
  process.exit(1);
}

async function main() {
  const file = path.resolve(process.argv.slice(2).join(' ') || 'soundboard.js');
  const filePath = path.parse(file);
  console.log(`Using file: ${file}`);
  if (path.extname(file) === '.cfg') {
    panic(`Specify a .js or .json file, not a .cfg.`);
  }

  const json = (await import(file).catch((e) => panic(`Could not open ${file}`, e)))
    .default;
  const error = checkValidity(json, file);
  if (error) {
    panic(error);
  }

  const outputCfg = path.format({ ...filePath, base: undefined, ext: '.cfg' });
  // filePath.name is the filename w/o ext, e.g. 'soundboard'
  const outputDir = path.join(filePath.dir, filePath.name); //
  const dirPrefix = path.join(
    typeof json.dir === 'string' ? json.dir : '',
    filePath.name
  );

  const outputFiles = soundboardCompiler(json, dirPrefix);
  // Need to unset `base` for it to see the change to `ext`
  console.log(`Saving files...`);

  await fs.writeFile(outputCfg, outputFiles.cfg, 'utf8');
  console.log(`${path.basename(outputCfg)}`);

  // Clear the old directory by rming it
  await fs.rm(outputDir, { recursive: true });
  await fs.mkdir(outputDir);
  console.log(filePath.name + '/');
  for (const file in outputFiles.lines) {
    const fileContent = outputFiles.lines[file];
    await fs.writeFile(path.join(outputDir, file), fileContent, 'utf8');
    console.log(`├── ${file}`);
  }
  console.log(
    `Wrote ${Object.keys(outputFiles.lines).length + 1} files to ${filePath.dir}`
  );
}

main();

function checkValidity(json, file) {
  if (typeof json !== 'object') {
    return `${file} did not export an object`;
  }

  const skippedKeys = Object.keys(json).filter(
    (key) => !LEGAL_TOP_LEVEL_KEYS.includes(key)
  );
  if (skippedKeys.length > 0) {
    return `${file} contains the following unused keys: ${skippedKeys.join(', ')}`;
  }
}
