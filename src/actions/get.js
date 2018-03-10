const isEmpty = require('lodash/isEmpty');
const getSuggestions = require('../suggest/get-suggestions');
const { notFoundModuleMessage } = require('../printer');
const renderModuleOccurrences = require('../render/render-module-occurrences');

module.exports = (workspace, name) => {
  const moduleOccurrences = workspace.getModuleOccurrences(name);
  const modulesNames = workspace.getModulesNames();

  if (isEmpty(moduleOccurrences)) {
    const suggestions = getSuggestions(name, modulesNames);

    return notFoundModuleMessage(name, suggestions);
  }

  return renderModuleOccurrences(moduleOccurrences);
};
