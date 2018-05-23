const opn = require('opn');
const prompts = require('prompts');
const isEmpty = require('lodash/isEmpty');
const getSuggestions = require('../suggest/get-suggestions');
const NotFoundModuleError = require('../errors/not-found-module-error');
const renderModuleOccurrences = require('../render/render-module-occurrences');

module.exports = (workspace, name, options = {}) => {
  const moduleOccurrences = workspace.getModuleOccurrences(name);
  const { open } = options;

  if (isEmpty(moduleOccurrences)) {
    const modulesNames = workspace.getModulesNames();
    const suggestions = getSuggestions(name, modulesNames);

    throw new NotFoundModuleError(name, suggestions);
  }

  if (open) {
    const opnOptions = { wait: false };
    if (moduleOccurrences.length === 1) {
      const { nodeModulesPath, name: moduleName } = moduleOccurrences[0];
      const packagePath = `${nodeModulesPath}/${moduleName}`;
      opn(packagePath, opnOptions);
    } else {
      const listItems = [];
      moduleOccurrences.forEach(item => {
        const { nodeModulesPath, version, parent, name: moduleName } = item;
        listItems.push({
          title: `${version} ${parent ? parent.name : 'node_modules'}`,
          value: `${nodeModulesPath}/${moduleName}`,
        });
      });

      prompts({
        type: 'select',
        name: 'value',
        message: 'Pick a package to open',
        choices: listItems,
        initial: 0,
      }).then(response => {
        opn(response.value, opnOptions);
      });
    }
  }

  return renderModuleOccurrences(moduleOccurrences, options);
};
