const isEmpty = require('lodash/isEmpty');
const { printVersions, notFoundModuleMessage } = require('../printer');

module.exports = (workspace, name) => {
  const modules = workspace.get(name);

  if (isEmpty(modules)) {
    return notFoundModuleMessage(name);
  }

  return printVersions(modules);
};
