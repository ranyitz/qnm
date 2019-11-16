const EventEmitter = require('events');
const chalk = require('chalk');
const { windows, unix } = require('./raw-key-codes');

const isWin = process.platform === 'win32';
module.exports = class Input extends EventEmitter {
  constructor({ stdin }) {
    super();
    this._value = [];
    this.cursorPos = 0;
    stdin.on('error', e => {
      this.end();
      // eslint-disable-next-line no-console
      console.error(e);
    });
    stdin.setRawMode(true);
    if (!isWin) stdin.setEncoding('utf8');
    stdin.on('data', this.onKeyPress.bind(this));
  }
  get value() {
    return this._value.join('');
  }
  get valueWithCursor() {
    if (this.cursorPos === this.value.length) {
      return this.value + chalk.inverse(' ');
    }
    const firstChunk = this.value.slice(0, this.cursorPos);
    const corsurChar = this.value.slice(this.cursorPos, this.cursorPos + 1);
    const secondChunk = this.value.slice(this.cursorPos + 1);
    return firstChunk + chalk.inverse(corsurChar) + secondChunk;
  }
  onWindowsKeyPress(key) {
    let changed = false;
    const code = key.toJSON().data.toString();
    switch (code) {
      case '3':
      case '4':
      case '27':
        this.emit('exit');
        process.exit(1);
        break;
      case '27,91,68':
        this.cursorPos = Math.max(0, this.cursorPos - 1);
        changed = true;
        break;
      case '27,91,67':
        this.cursorPos = Math.min(this._value.length, this.cursorPos + 1);
        changed = true;
        break;
      case '8':
        if (this.cursorPos !== 0) {
          this._value.splice(this.cursorPos - 1, 1);
          this.cursorPos = Math.max(0, this.cursorPos - 1);
          changed = true;
        }
        break;
      case '27,91,51,126':
        if (this._value.length > this.cursorPos) {
          this._value.splice(this.cursorPos, 1);
          changed = true;
        }
        break;
      case '27,91,65':
        this.emit('up');
        break;
      case '27,91,66':
        this.emit('down');
        break;
      case '13':
        this.emit('choose');
        break;
      case '96':
        this.emit('tab');
        break;
      case '9':
        this.emit('shiftTab');
        break;
      default:
        this.insertChar(key);
        changed = true;
    }
    if (changed) {
      this.emit('change', this);
    }
  }
  onKeyPress(key) {
    let keyMap;
    let keyCode;
    let char;
    if (isWin) {
      keyMap = windows;
      keyCode = key.toJSON().data.toString();
      char = key.toString();
    } else {
      keyMap = unix;
      keyCode = key;
      char = key;
    }
    const {
      ctrlC,
      ctrlD,
      esc,
      left,
      right,
      backspace,
      del,
      up,
      down,
      enter,
      tab,
      shiftTab,
    } = keyMap;
    let changed = false;
    switch (keyCode) {
      case ctrlC:
      case ctrlD:
      case esc:
        this.emit('exit');
        process.exit(1);
        break;
      case left:
        this.cursorPos = Math.max(0, this.cursorPos - 1);
        changed = true;
        break;
      case right:
        this.cursorPos = Math.min(this._value.length, this.cursorPos + 1);
        changed = true;
        break;
      case backspace:
        if (this.cursorPos !== 0) {
          this._value.splice(this.cursorPos - 1, 1);
          this.cursorPos = Math.max(0, this.cursorPos - 1);
          changed = true;
        }
        break;
      case del:
        if (this._value.length > this.cursorPos) {
          this._value.splice(this.cursorPos, 1);
          changed = true;
        }
        break;
      case up:
        this.emit('up');
        break;
      case down:
        this.emit('down');
        break;
      case enter:
        this.emit('choose');
        break;
      case tab:
        this.emit('tab');
        break;
      case shiftTab:
        this.emit('shiftTab');
        break;
      default:
        this.insertChar(char);
        changed = true;
    }
    if (changed) {
      this.emit('change', this);
    }
  }
  insertChar(char) {
    this._value.splice(this.cursorPos, 0, char);
    this.cursorPos++;
  }
  end() {
    this.removeAllListeners();
  }
};
//# sourceMappingURL=input.js.map
