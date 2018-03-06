const chalk = require('chalk');

function printSingleModule(moduleObject) {
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

module.exports.printModules = (modules) => {
  return modules.map(m => printSingleModule(m.toObject())).join('\n');
};
