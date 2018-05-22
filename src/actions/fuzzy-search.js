const chalk = require('chalk');
const figures = require('figures');
const logUpdate = require('log-update');
const isEmpty = require('lodash/isEmpty');

const Input = require('../fuzzy-search/input');
const sortBySimilarity = require('../fuzzy-search/sort-by-similarity');
const getAction = require('./get');

const HALF_WIDTH_SPACE = '\u2000';

const resetConsole = () => process.stdout.write('\x1Bc');

const getResultState = ({ chosen, result, i, currentResult }) => {
  const isMarked = chosen.indexOf(result.value) !== -1;
  const isCurrent = i === currentResult;

  if (isCurrent && isMarked) {
    return 'current&marked';
  }

  if (isCurrent) {
    return 'current';
  }

  if (isMarked) {
    return 'marked';
  }

  return 'plain';
};

const renderItem = ({ state, result }) => {
  switch (state) {
    case 'current': {
      return `${chalk.red(figures.pointer)} ${chalk.bold(result.highlight)}`;
    }
    case 'marked': {
      return `${HALF_WIDTH_SPACE}${chalk.magenta(figures.pointer)}${
        result.highlight
      }`;
    }
    case 'current&marked': {
      return `${chalk.red(figures.pointer)}${chalk.magenta(
        figures.pointer,
      )}${chalk.bold(result.highlight)}`;
    }
    default: {
      return ` ${result.highlight}`;
    }
  }
};

const toggleMarking = ({ chosen, value }) => {
  return chosen.indexOf(value) !== -1
    ? chosen.filter(moduleName => moduleName !== value)
    : chosen.concat(value);
};

module.exports = workspace => {
  let results = [];
  let chosen = [];
  let currentResult = 0;
  let currentInputValue = '';

  const modulesNames = workspace.getModulesNames();

  const renderResults = () => {
    return results
      .map((result, i) => {
        const state = getResultState({
          chosen,
          result,
          i,
          currentResult,
        });

        return renderItem({ state, result });
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

  input.on('tab', () => {
    if (isEmpty(results)) return;

    const { value } = results[currentResult];

    chosen = toggleMarking({ chosen, value });

    if (currentResult < results.length - 1) {
      currentResult++;
    }

    renderUi();
  });

  input.on('shiftTab', () => {
    if (isEmpty(results)) return;

    const { value } = results[currentResult];

    chosen = toggleMarking({ chosen, value });

    if (currentResult > 0) {
      currentResult--;
    }

    renderUi();
  });

  input.on('choose', () => {
    if (isEmpty(results) && isEmpty(chosen)) {
      return;
    }

    input.end();
    logUpdate('');

    if (isEmpty(chosen)) {
      chosen.push(results[currentResult].value);
    }

    chosen.forEach(moduleName => {
      console.log(getAction(workspace, moduleName)); // eslint-disable-line no-console
    });

    process.exit(0);
  });

  input.on('exit', () => {
    logUpdate('');
  });
};
