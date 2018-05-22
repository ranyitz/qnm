const isEmpty = require('lodash/isEmpty');
const getSuggestions = require('../suggest/get-suggestions');
const NotFoundModuleError = require('../errors/not-found-module-error');
const renderModuleOccurrences = require('../render/render-module-occurrences');

module.exports = (workspace, name, options = {}) => {
  const moduleOccurrences = workspace.getModuleOccurrences(name);

  if (isEmpty(moduleOccurrences)) {
    const modulesNames = workspace.getModulesNames();
    const suggestions = getSuggestions(name, modulesNames);

    throw new NotFoundModuleError(name, suggestions);
  }

  return renderModuleOccurrences(moduleOccurrences, options);
};
