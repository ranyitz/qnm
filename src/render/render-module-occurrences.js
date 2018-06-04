const archy = require('archy');
const chalk = require('chalk');
// const isEmpty = require('lodash/isEmpty');
const renderVersion = require('./render-version');

const highlightMatch = (str, match) =>
  str.split(match).join(chalk.magenta(match));

const getWhyInfo = m => {
  const { whyInfo } = m;
  console.log(JSON.stringify(whyInfo, null, 2));
  // return !isEmpty(whyInfo) && !m.parent
  //   ? ` ${chalk.yellow(`(${m.whyInfo.join(', ')})`)}`
  //   : '';
};

const buildWithAncestors = (m, { why, noColor }) => {
  const whyInfo = why ? getWhyInfo(m) : '';
  const version = noColor ? m.version : renderVersion(m.name, m.version);
  const information = version + whyInfo;

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

module.exports = (moduleOccurrences, { match, why, noColor } = {}) => {
  const moduleName = highlightMatch(moduleOccurrences[0].name, match);
  const buildedOccurrences = moduleOccurrences.map(m =>
    buildWithAncestors(m, {
      why,
      renderVersion,
      noColor,
    }),
  );

  const tree = archy({
    label: chalk.underline(moduleName),
    nodes: buildedOccurrences,
  });

  return tree;
};
