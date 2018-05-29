const isEmpty = require('lodash/isEmpty');
const opn = require('opn');
const getSuggestions = require('../suggest/get-suggestions');
const NotFoundModuleError = require('../errors/not-found-module-error');
const NotFoundHomepageError = require('../errors/not-found-homepage-error');
const renderModuleOccurrences = require('../render/render-module-occurrences');
const openPackage = require('./helpers/open');

module.exports = (workspace, name, options = {}) => {
  const moduleOccurrences = workspace.getModuleOccurrences(name);
  const { open, homepage } = options;

  if (isEmpty(moduleOccurrences)) {
    const modulesNames = workspace.getModulesNames();
    const suggestions = getSuggestions(name, modulesNames);

    throw new NotFoundModuleError(name, suggestions);
  }

  if (open) {
    return openPackage(moduleOccurrences, workspace.root);
  }

  if (homepage) {
    // take only the first option
    const [nodeModule] = workspace.getModuleOccurrences(name);
    const homepageUrl = nodeModule.packageJson.homepage;

    if (!homepageUrl) throw new NotFoundHomepageError(name);

    return opn(homepageUrl, { wait: false });
  }

  return renderModuleOccurrences(moduleOccurrences, options);
};
