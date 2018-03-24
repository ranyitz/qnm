const isEmpty = require('lodash/isEmpty');
const { notMatchModuleMessage } = require('../printer');
const renderModuleList = require('../render/render-module-list');

module.exports = (workspace, match, options = {}) => {
  const moduleOccurrencesList = workspace.match(match);

  if (isEmpty(moduleOccurrencesList)) {
    return notMatchModuleMessage(match);
  }

  return renderModuleList(moduleOccurrencesList, {
    match,
    json: options.json,
  });
};
