const chalk = require('chalk');
const isEmpty = require('lodash/isEmpty');

function paintDiffInBold(from, to) {
  return to
    .split('')
    .map((char, index) => {
      if (char !== from.charAt(index)) {
        return chalk.bold(char);
      }

      return char;
    })
    .join('');
}

module.exports = class NotFoundModuleError extends Error {
  constructor(name, suggestions) {
    let message = `Could not find any module by the name "${name}".`;

    if (!isEmpty(suggestions)) {
      message += ` Did you mean "${paintDiffInBold(name, suggestions[0])}"?`;
    }

    super(message);
  }
};
