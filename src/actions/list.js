const isEmpty = require('lodash/isEmpty');
const NoModulesError = require('../errors/no-modules-error');
const renderModuleList = require('../render/render-module-list');

module.exports = workspace => {
  const moduleOccurrencesList = workspace.list();

  if (isEmpty(moduleOccurrencesList)) {
    throw new NoModulesError();
  }

  return renderModuleList(moduleOccurrencesList);
};
