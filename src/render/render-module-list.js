const renderModuleOccurrences = require('./render-module-occurrences');
const renderModuleOccurrencesJson = require('./render-module-occurrences-json');

module.exports = (moduleOccurrencesList, options) => {
  if (options.json) {
    return JSON.stringify(
      moduleOccurrencesList.map(([, moduleOccurrences]) =>
        renderModuleOccurrencesJson(moduleOccurrences, options),
      ),
    );
  }

  return moduleOccurrencesList
    .map(([, moduleOccurrences]) =>
      renderModuleOccurrences(moduleOccurrences, options),
    )
    .join('\n');
};
