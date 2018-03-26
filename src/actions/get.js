const isEmpty = require('lodash/isEmpty');
const getSuggestions = require('../suggest/get-suggestions');
const NotFoundModuleError = require('../errors/not-found-module-error');
const renderModuleOccurrences = require('../render/render-module-occurrences');
const renderModuleOccurrencesJson = require('../render/render-module-occurrences-json');

module.exports = (workspace, name, options = {}) => {
  const moduleOccurrences = workspace.getModuleOccurrences(name);
  const modulesNames = workspace.getModulesNames();

  if (isEmpty(moduleOccurrences)) {
    const suggestions = getSuggestions(name, modulesNames);

    throw new NotFoundModuleError(name, suggestions);
  }

  if (options.json) {
    return JSON.stringify(
      renderModuleOccurrencesJson(moduleOccurrences, options),
    );
  }

  return renderModuleOccurrences(moduleOccurrences, options);
};
