const Input = require('../interactive/input');
const logUpdate = require('log-update');
const sortBySimilarity = require('../interactive/sort-by-similarity');
const getAction = require('./get');
const chalk = require('chalk');
const figures = require('figures');

const resetConsole = () => process.stdout.write('\x1Bc');

module.exports = workspace => {
  let results = [];
  let currentResult = 0;
  let currentInputValue = '';

  const modulesNames = workspace.getModulesNames();

  const renderResults = () => {
    return results
      .map((result, i) => {
        if (i === currentResult) {
          return `${chalk.red(figures.pointer)} ${chalk.bold(
            result.highlight,
          )}`;
        }
        return ` ${result.highlight}`;
      })
      .join('\n');
  };

  const renderInputValue = () => {
    if (currentInputValue === '') {
      return `${chalk.cyan(figures.pointer)} ${chalk.inverse(' ')} ${chalk.grey(
        'start typing to use the fuzzy search',
      )}`;
    }
    return `${chalk.cyan(figures.pointer)} ${currentInputValue}`;
  };

  const renderAmountOfResults = () => {
    return chalk.dim.yellow(`${results.length}/${modulesNames.length}`);
  };

  const renderUi = () => {
    logUpdate(
      `${renderInputValue()}\n${renderAmountOfResults()}\n${renderResults()}`,
    );
  };

  resetConsole();
  renderUi();

  const input = new Input({
    stdin: process.stdin,
  });

  input.on('change', obj => {
    currentInputValue = obj.valueWithCursor;
    results = sortBySimilarity(modulesNames, obj.value);

    if (currentResult > results.length - 1 && results.length !== 0) {
      currentResult = results.length - 1;
    }
    renderUi();
  });

  input.on('up', () => {
    if (currentResult > 0) {
      currentResult--;
    }
    renderUi();
  });

  input.on('down', () => {
    if (currentResult < results.length - 1) {
      currentResult++;
    }
    renderUi();
  });

  input.on('choose', () => {
    if (results.length === 0) {
      return;
    }
    input.end();
    logUpdate('');
    const chosen = results[currentResult].value;
    console.log(getAction(workspace, chosen));
    process.exit(0);
  });
};
