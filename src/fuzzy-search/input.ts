import { EventEmitter } from 'events';
import { ReadStream } from 'tty';
import chalk from 'chalk';
import { windows, unix } from './raw-key-codes';

const isWin = process.platform === 'win32';

export default class Input extends EventEmitter {
  _value: Array<any>;
  cursorPos: number;

  constructor({ stdin }: { stdin: ReadStream }) {
    super();
    this._value = [];
    this.cursorPos = 0;

    stdin.on('error', (e) => {
      this.end();
      // eslint-disable-next-line no-console
      console.error(e);
    });

    stdin.setRawMode(true);
    if (!isWin) {
      stdin.setEncoding('utf8');
    }

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

  onKeyPress(key: Buffer): void {
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

  insertChar(char: string | Buffer) {
    this._value.splice(this.cursorPos, 0, char);
    this.cursorPos++;
  }

  end(): void {
    this.removeAllListeners();
  }
}
