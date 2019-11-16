const isEmpty = require('lodash/isEmpty');
const NoModulesError = require('../errors/no-modules-error');
const renderModuleList = require('../render/render-module-list');

module.exports = (workspace, options = {}) => {
  if (options.deps) {
    const moduleOccurrencesList = workspace.listPackageJsonDependencies();
    return renderModuleList(moduleOccurrencesList, options);
  }
  const moduleOccurrencesList = workspace.list();
  if (isEmpty(moduleOccurrencesList)) {
    throw new NoModulesError();
  }
  return renderModuleList(moduleOccurrencesList, options);
};
//# sourceMappingURL=list.js.map
