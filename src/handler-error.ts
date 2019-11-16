import chalk from 'chalk';

export default (error: Error, debug: boolean) => {
  if (!debug) {
    console.error(chalk.red(error.message.replace('Error: ', '')));
  } else {
    console.error(error.stack);
  }

  process.exit(1);
};
