const isEmpty = require('lodash/isEmpty');
const { noModulesMessage } = require('../printer');
const renderModuleList = require('../render/render-module-list');

module.exports = (workspace, options = {}) => {
  const moduleOccurrencesList = workspace.list();

  if (isEmpty(moduleOccurrencesList)) {
    return noModulesMessage();
  }

  return renderModuleList(moduleOccurrencesList, options);
};
