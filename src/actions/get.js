const isEmpty = require('lodash/isEmpty');
const getSuggestions = require('../suggest/get-suggestions');
const { printVersions, notFoundModuleMessage } = require('../printer');

module.exports = (workspace, name) => {
  const modules = workspace.get(name);
  const modulesNames = workspace.getModulesNames();

  if (isEmpty(modules)) {
    const suggestions = getSuggestions(name, modulesNames);

    return notFoundModuleMessage(name, suggestions);
  }

  return printVersions(modules);
};
