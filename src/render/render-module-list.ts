const renderModuleOccurrences = require('./render-module-occurrences');

module.exports = (moduleOccurrencesList, options) => {
  return moduleOccurrencesList
    .map(([, moduleOccurrences]) =>
      renderModuleOccurrences(moduleOccurrences, options),
    )
    .join('\n');
};
