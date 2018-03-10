const chalk = require('chalk');
const isEmpty = require('lodash/isEmpty');

function highlightMatch(str, match) {
  return str.split(match).join(chalk.magenta(match));
}

function printSingleVersion(moduleObject) {
  const getParents = () => {
    const parentsList = [];
    let currentParent = moduleObject.parent;

    while (currentParent) {
      parentsList.push(currentParent);
      currentParent = currentParent.parent;
    }

    return parentsList.map(p => chalk.magenta(`(${p.name})`)).join(' ');
  };

  return `> ${chalk.bold(moduleObject.version)} ${getParents()}`.trim();
}

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

module.exports.printVersions = modules => {
  return modules.map(m => printSingleVersion(m.toObject())).join('\n');
};

module.exports.printModulesList = (modulesList, { match } = {}) => {
  return modulesList
    .map(
      ([name, nodeModule]) =>
        `${highlightMatch(name, match)} ${exports.printVersions(nodeModule)}`,
    )
    .join('\n');
};

module.exports.notFoundModuleMessage = (name, suggestions) => {
  let message = chalk.red(`Could not find any module by the name "${name}".`);

  if (!isEmpty(suggestions)) {
    message += chalk.red(
      ` Did you mean "${paintDiffInBold(name, suggestions[0])}?"`,
    );
  }

  return message;
};

module.exports.notMatchModuleMessage = str =>
  chalk.red(`Could not find any module that matches "${str}"`);

module.exports.noModulesMessage = () =>
  chalk.red('Could not find any module in the node_modules directory');
