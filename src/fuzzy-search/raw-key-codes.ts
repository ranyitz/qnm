export const unix = {
  ctrlC: '\u0003',
  ctrlD: '\u0004',
  esc: '\u001b',
  left: '\u001b\u005b\u0044',
  right: '\u001b\u005b\u0043',
  up: '\u001b\u005b\u0041',
  down: '\u001b\u005b\u0042',
  enter: '\u000d',
  del: '\u001b\u005b\u0033\u007e',
  backspace: '\u007f',
  tab: '\u0009',
  shiftTab: '\u001b[Z',
};

export const windows = {
  ctrlC: '3',
  ctrlD: '4',
  esc: '27',
  left: '27,91,68',
  right: '27,91,67',
  up: '27,91,65',
  down: '27,91,66',
  enter: '13',
  del: '27,91,51,126',
  backspace: '8',
  tab: '9',
  shiftTab: '888',
};
