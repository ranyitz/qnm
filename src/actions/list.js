const isEmpty = require('lodash/isEmpty');
const { printModulesList, noModulesMessage } = require('../printer');

module.exports = (workspace) => {
  const modulesList = workspace.list();

  if (isEmpty(modulesList)) {
    return noModulesMessage();
  }

  return printModulesList(modulesList);
};
