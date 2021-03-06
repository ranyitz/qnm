import path from 'path';
import chalk from 'chalk';
import isEmpty from 'lodash/isEmpty';
import archy from 'archy';
import terminalLink, {
  isSupported as isTerminalLinkSupported,
} from 'terminal-link';
import NodeModule from '../workspace/node-module';
import { CliOptions } from '../cli';
import renderVersion from './render-version';

const highlightMatch = (str: string, match: string) =>
  str.split(match).join(chalk.magenta(match));

const getWhyInfo = (m: NodeModule) => {
  const { whyInfo } = m;
  return !isEmpty(whyInfo) && !m.parent
    ? ` ${chalk.yellow(`(${m.whyInfo.join(', ')})`)}`
    : '';
};

type TreeNode = { label: string; nodes: Array<TreeNode> } | string;

const buildWithAncestors = (m: NodeModule, { noColor }: CliOptions) => {
  const whyInfo = getWhyInfo(m);
  const version = noColor ? m.version : renderVersion(m.name, m.version);
  const versionWithLink = isTerminalLinkSupported
    ? terminalLink(version, path.join('File:///', m.path, 'package.json'))
    : version;
  const symlink = m.symlink ? chalk.magenta(` -> ${m.symlink}`) : '';
  const information = versionWithLink + symlink + whyInfo;

  let hierarchy: Array<TreeNode> = [information];

  if (m.parent) {
    let currentModule = m;

    while (currentModule.parent) {
      currentModule = currentModule.parent;
      hierarchy = [{ label: chalk.grey(currentModule.name), nodes: hierarchy }];
    }
  }

  return hierarchy[0];
};

export default (
  moduleOccurrences: Array<NodeModule>,
  { match, noColor }: CliOptions = {},
  monorepoPackageName?: string,
) => {
  const moduleName = highlightMatch(moduleOccurrences[0].name, match!);
  const buildedOccurrences = moduleOccurrences.map((m) =>
    buildWithAncestors(m, {
      noColor,
    }),
  );

  const packageInfo = {
    label: chalk.underline(moduleName),
    nodes: buildedOccurrences,
  };

  if (monorepoPackageName) {
    return archy({
      label: chalk.bold(monorepoPackageName),
      nodes: [packageInfo],
    });
  }

  return archy(packageInfo);
};
