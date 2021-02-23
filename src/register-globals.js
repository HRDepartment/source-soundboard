import { MAX_LINE_LENGTH } from './consts.js';
import { SayCommand } from './symbols.js';

function downgradeTemplateString(...str) {
  if (str.length < 2) return str[0] || '';
  // @ts-expect-error Length handled by this function
  return String.raw(...str);
}

function ensureStringObject(str) {
  return str instanceof String ? str : new String(str);
}

// If originalStr was a `new String`, copy over any symbols and their values into `newStr`
function copyStringSymbols(originalStr, newStr) {
  if (originalStr instanceof String) {
    newStr = new String(newStr);
    for (const sym of Object.getOwnPropertySymbols(originalStr)) {
      newStr[sym] = originalStr[sym];
    }
  }
  return newStr;
}

function setSymbolOnString(sym, value) {
  // To be called either with a template string (say`Text`) or in a chain by another symbol setting function (a(say`text`))
  return function (...templateString) {
    const str = ensureStringObject(downgradeTemplateString(...templateString));
    // @ts-expect-error Incorrect for `new String`
    str[sym] = value;
    return str;
  };
}

globalThis.say = setSymbolOnString(SayCommand, 'say');
globalThis.say_team = setSymbolOnString(SayCommand, 'say_team');
globalThis.say_party = setSymbolOnString(SayCommand, 'say_party');

globalThis.assert_lines = (text, lines) => {
  const lineCount = Math.ceil(text.length / MAX_LINE_LENGTH);
  if (lineCount !== lines) {
    throw new Error(`Text "${text}" is ${lineCount} lines, expected ${lines}`);
  }
  return text;
};

globalThis.assert_1line = (text) => globalThis.assert_lines(text, 1);

globalThis.fill_line = globalThis.fill_lines = (text, maxLines = 1) => {
  const repeated = text.trim() + ' ';
  const maxLength = maxLines * MAX_LINE_LENGTH;
  // -1 as we will remove the trailing space at the end
  if (repeated.length - 1 > maxLength) {
    throw new Error(
      `Text "${text}" is ${
        maxLength - text.length - 1
      } characters too long to repeat on the requested number of lines (${maxLines})`
    );
  }
  return copyStringSymbols(
    text,
    repeated.repeat(Math.floor(maxLength / repeated.length)).trim()
  );
};
