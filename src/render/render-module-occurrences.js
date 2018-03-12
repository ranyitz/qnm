const archy = require('archy');
const chalk = require('chalk');
const isEmpty = require('lodash/isEmpty');

const highlightMatch = (str, match) =>
  str.split(match).join(chalk.magenta(match));

const getWhyInfo = m => {
  const { whyInfo } = m;
  return !isEmpty(whyInfo) && !m.parent
    ? ` ${chalk.yellow(`(${m.whyInfo.join(', ')})`)}`
    : '';
};

const buildWithAncestors = (m, { why }) => {
  const whyInfo = why ? getWhyInfo(m) : '';
  const information = m.version + whyInfo;

  let hierarchy = [information];

  if (m.parent) {
    let currentModule = m;

    while (currentModule.parent) {
      currentModule = currentModule.parent;
      hierarchy = [{ label: chalk.grey(currentModule.name), nodes: hierarchy }];
    }
  }

  return hierarchy[0];
};

module.exports = (moduleOccurrences, { match, why } = {}) => {
  const moduleName = highlightMatch(moduleOccurrences[0].name, match);
  const buildedOccurrences = moduleOccurrences.map(m =>
    buildWithAncestors(m, { why }),
  );

  const tree = archy({
    label: chalk.underline(moduleName),
    nodes: buildedOccurrences,
  });

  return tree;
};
