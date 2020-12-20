import chalk from 'chalk';
import figures from 'figures';
import logUpdate from 'log-update';
import isEmpty from 'lodash/isEmpty';
import Input from '../fuzzy-search/input';
import sortBySimilarity from '../fuzzy-search/sort-by-similarity';
import Workspace from '../workspace/workspace';
import { CliOptions } from '../cli';
import getAction from './get';
import { clearTerminal } from './helpers/terminal';

const HALF_WIDTH_SPACE = '\u2000';

type Result = { value: string; highlight: string };
type State = 'current' | 'marked' | 'plain' | 'current&marked';

const getResultState = ({
  chosenModules,
  result,
  i,
  currentResult,
}: {
  chosenModules: Array<string>;
  result: Result;
  i: number;
  currentResult: number;
}): State => {
  const isMarked = chosenModules.indexOf(result.value) !== -1;
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

const renderItem = ({ state, result }: { state: State; result: Result }) => {
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

const toggleMarking = ({
  chosenModules,
  value,
}: {
  chosenModules: Array<string>;
  value: string;
}) => {
  return chosenModules.indexOf(value) !== -1
    ? chosenModules.filter((moduleName) => moduleName !== value)
    : chosenModules.concat(value);
};

export default (workspace: Workspace, options: CliOptions) => {
  let results: Array<Result> = [];
  let chosenModules: Array<string> = [];
  let currentResult = 0;
  let currentInputValue = '';

  const modulesNames = workspace.getModulesNames();

  const renderResults = () => {
    return results
      .map((result, i) => {
        const state = getResultState({
          chosenModules,
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

  clearTerminal();
  renderUi();

  const input = new Input({
    stdin: process.stdin,
  });

  input.on('change', (obj: Input) => {
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
    if (isEmpty(results)) {
      return;
    }

    const { value } = results[currentResult];

    chosenModules = toggleMarking({ chosenModules, value });

    if (currentResult < results.length - 1) {
      currentResult++;
    }

    renderUi();
  });

  input.on('shiftTab', () => {
    if (isEmpty(results)) {
      return;
    }

    const { value } = results[currentResult];

    chosenModules = toggleMarking({ chosenModules, value });

    if (currentResult > 0) {
      currentResult--;
    }

    renderUi();
  });

  input.on('choose', () => {
    if (isEmpty(results) && isEmpty(chosenModules)) {
      return;
    }

    input.end();
    logUpdate('');

    if (isEmpty(chosenModules)) {
      chosenModules.push(results[currentResult].value);
    }

    chosenModules.forEach((moduleName) => {
      console.log(getAction(workspace, moduleName, options)); // eslint-disable-line no-console
    });

    process.exit(0);
  });

  input.on('exit', () => {
    logUpdate('');
  });
};
