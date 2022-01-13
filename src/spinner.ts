const cursor = require('ansi')(process.stdout);

const signs = ['|', '/', '-', '\\'];

let index = 0;
let interval: any;

function start() {
  cursor.hide();

  index = 0;
  process.stdout.write(signs[index]);

  interval = setInterval(function () {
    process.stdout.write(signs[index].replace(/./g, '\b'));
    index = index < signs.length - 1 ? index + 1 : 0;
    process.stdout.write(signs[index]);
  }, 100);
}

function stop() {
  cursor.show();
  clearInterval(interval);
  process.stdout.write(signs[index].replace(/./g, '\b'));
}

export const spinner = {
  start,
  stop,
};
