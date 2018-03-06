/* eslint-disable no-console */
const chalk = require('chalk');

module.exports = (error, verbose) => {
  if (!verbose) {
    console.error(chalk.red(error.toString()));
  } else {
    console.error(error.stack);
  }
};
