const archy = require('archy');
const chalk = require('chalk');

const highlightMatch = (str, match) => str.split(match).join(chalk.magenta(match));

const buildWithAncestors = (m) => {
  let hierarchy = [m.version];

  if (m.parent) {
    let currentModule = m;

    while (currentModule.parent) {
      currentModule = currentModule.parent;
      hierarchy = [{ label: chalk.grey(currentModule.name), nodes: hierarchy }];
    }
  }

  return hierarchy[0];
};

module.exports = (moduleOccurrences, { match } = {}) => {
  const moduleName = highlightMatch(moduleOccurrences[0].name, match);
  const buildedOccurrences = moduleOccurrences.map(buildWithAncestors);
  const tree = archy({ label: moduleName, nodes: buildedOccurrences });

  return tree;
};

