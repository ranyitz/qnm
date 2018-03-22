/* eslint-disable no-console */
const chalk = require('chalk');

module.exports = (error, debug) => {
  if (!debug) {
    console.error(chalk.red(error.message.replace('Error: ', '')));
  } else {
    console.error(error.stack);
  }

  process.exit(1);
};
