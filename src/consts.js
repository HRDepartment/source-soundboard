// Maximum amount of chars per chat message (dictated by Source)
export const MAX_LINE_LENGTH = 127;
// Source has a command text length limit of 512
export const MAX_COMMANDS_PER_LINE = 3;
export const MAX_COMMAND_LENGTH = 512;
export const DIGIT_KEY_MAP = {
  0: 'KP_INS',
  1: 'KP_END',
  2: 'KP_DOWNARROW',
  3: 'KP_PGDN',
  4: 'KP_LEFTARROW',
  5: 'KP_5',
  6: 'KP_RIGHTARROW',
  7: 'KP_HOME',
  8: 'KP_UPARROW',
  9: 'KP_PGUP',
};
// Press 0 to reset soundboard
// Valid keys in the hierarchy of a soundboard file
export const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
// Valid top-level keys in a soundboard file
export const LEGAL_TOP_LEVEL_KEYS = [...DIGITS.map(String), 'wait'];
