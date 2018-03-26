const isEmpty = require('lodash/isEmpty');
const getSuggestions = require('../suggest/get-suggestions');
const NotFoundModuleError = require('../errors/not-found-module-error');
const NotFoundHomepageError = require('../errors/not-found-homepage-error');

module.exports = (workspace, name) => {
  const moduleOccurrences = workspace.getModuleOccurrences(name);
  const modulesNames = workspace.getModulesNames();

  if (isEmpty(moduleOccurrences)) {
    const suggestions = getSuggestions(name, modulesNames);

    throw new NotFoundModuleError(name, suggestions);
  }
  const homepageLink = moduleOccurrences[0].packageJson.homepage;

  if (!homepageLink) {
    throw new NotFoundHomepageError(name);
  }

  return homepageLink;
};
