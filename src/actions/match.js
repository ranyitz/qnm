const isEmpty = require('lodash/isEmpty');
const NotMatchModuleError = require('../errors/not-match-module-error');
const renderModuleList = require('../render/render-module-list');

module.exports = (workspace, match) => {
  const moduleOccurrencesList = workspace.match(match);

  if (isEmpty(moduleOccurrencesList)) {
    throw new NotMatchModuleError(match);
  }

  return renderModuleList(moduleOccurrencesList, { match });
};
