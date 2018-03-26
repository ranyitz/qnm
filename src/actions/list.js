const isEmpty = require('lodash/isEmpty');
const NoModulesError = require('../errors/no-modules-error');
const renderModuleList = require('../render/render-module-list');

module.exports = (workspace, options = {}) => {
  const moduleOccurrencesList = workspace.list();
  const listDependencies = workspace.listDependencies();

  if (isEmpty(moduleOccurrencesList)) {
    throw new NoModulesError();
  }

  if (options.deps) {
    return renderModuleList(listDependencies);
  }

  return renderModuleList(moduleOccurrencesList);
};
