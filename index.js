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
  console.log(`Using file: ${file}`);
  const json = (await import(file).catch((e) => panic(`Could not open ${file}`, e)))
    .default;

  if (typeof json !== 'object') {
    panic(`${file} did not export an object`);
  }

  const skippedKeys = Object.keys(json).filter(
    (key) => !LEGAL_TOP_LEVEL_KEYS.includes(key)
  );
  if (skippedKeys.length > 0) {
    panic(`${file} contains the following unused keys: ${skippedKeys.join(', ')}`);
  }

  const output = soundboardCompiler(json);
  const outputFile = path.format({ ...path.parse(file), base: undefined, ext: '.cfg' });

  if (file === outputFile) {
    panic(`Attempting to overwrite file ${file}, exiting`);
  }

  console.log(`Saving to: ${outputFile}`);
  await fs.writeFile(outputFile, output);
}

main();
