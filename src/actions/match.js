const isEmpty = require('lodash/isEmpty');
const { printModulesList, notMatchModuleMessage } = require('../printer');

module.exports = (workspace, match) => {
  const modulesList = workspace.match(match);

  if (isEmpty(modulesList)) {
    return notMatchModuleMessage(match);
  }

  return printModulesList(modulesList, { match });
};
