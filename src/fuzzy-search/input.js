const EventEmitter = require('events');
const chalk = require('chalk');
const {
  ctrlC,
  ctrlD,
  esc,
  left,
  right,
  up,
  down,
  enter,
  del,
  backspace,
} = require('./raw-key-codes');

module.exports = class Input extends EventEmitter {
  constructor({ stdin }) {
    super();

    this._value = [];
    this.cursorPos = 0;

    stdin.setRawMode(true);
    stdin.setEncoding('utf8');

    stdin.on('error', e => {
      this.end();
      console.error(e);
    });

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

  onKeyPress(key) {
    let changed = false;

    switch (key) {
      case ctrlC:
      case ctrlD:
      case esc:
        this.emit('exit');
        process.emit('SIGINT');
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
      default:
        this.insertChar(key);
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
