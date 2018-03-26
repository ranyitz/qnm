const isEmpty = require('lodash/isEmpty');
const getSuggestions = require('../suggest/get-suggestions');
const NotFoundModuleError = require('../errors/not-found-module-error');

module.exports = (workspace, name) => {
  const moduleOccurrences = workspace.getModuleOccurrences(name);
  const modulesNames = workspace.getModulesNames();

  if (isEmpty(moduleOccurrences)) {
    const suggestions = getSuggestions(name, modulesNames);

    throw new NotFoundModuleError(name, suggestions);
  }

  return moduleOccurrences[0].packageJson.homepage;
};
