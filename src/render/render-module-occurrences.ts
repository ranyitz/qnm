import path from 'path';
import chalk from 'chalk';
import isEmpty from 'lodash/isEmpty';
import archy from 'archy';
import terminalLink, {
  isSupported as isTerminalLinkSupported,
} from 'terminal-link';
import * as timeago from 'timeago.js';
import semver from 'semver';
import NodeModule from '../workspace/node-module';
import { CliOptions } from '../cli';
import renderVersion from './render-version';

const getVersionDiffSymbol = (
  version: string,
  latestVersion: string,
): string => {
  const diff = semver.diff(latestVersion, version);

  switch (diff) {
    case null:
      return chalk.dim.green('✓');
    case 'premajor':
    case 'major':
      return chalk.dim.red('⇡');
    case 'preminor':
    case 'minor':
      return chalk.dim.yellow('⇡');
    case 'prepatch':
    case 'patch':
      return chalk.dim('⇡');
    default:
      return '';
  }
};
const formatTime = (date: Date): string => {
  if (process.env.NODE_ENV === 'test') {
    return 'just now';
  }

  return timeago.format(date);
};

const highlightMatch = (str: string, match: string) =>
  str.split(match).join(chalk.magenta(match));

const getWhyInfo = (m: NodeModule) => {
  const { whyInfo } = m;
  return !isEmpty(whyInfo) && !m.parent
    ? ` ${chalk.dim.yellow(`(${m.whyInfo.join(', ')})`)}`
    : '';
};

type TreeNode = { label: string; nodes: Array<TreeNode> } | string;

const buildWithAncestors = (m: NodeModule, { noColor, remote }: CliOptions) => {
  const whyInfo = getWhyInfo(m);
  const version = noColor ? m.version : renderVersion(m.name, m.version);
  const versionWithLink = isTerminalLinkSupported
    ? terminalLink(version, path.join('File:///', m.path, 'package.json'))
    : version;
  const symlink = m.symlink ? chalk.magenta(` -> ${m.symlink}`) : '';

  let releaseDate = '';
  let versionDiffSymbol = '';

  if (remote) {
    releaseDate =
      m.version === m.latestVersion
        ? ''
        : chalk.grey(` ${formatTime(m.releaseDate)}`);

    versionDiffSymbol = ' ' + getVersionDiffSymbol(m.version, m.latestVersion);
  }

  const information =
    versionWithLink + symlink + versionDiffSymbol + releaseDate + whyInfo;

  let hierarchy: Array<TreeNode> = [information];

  if (m.parent) {
    let currentModule = m;

    while (currentModule.parent) {
      currentModule = currentModule.parent;
      hierarchy = [{ label: chalk.dim(currentModule.name), nodes: hierarchy }];
    }
  }

  return hierarchy[0];
};

export default (
  moduleOccurrences: Array<NodeModule>,
  { match, noColor, remote }: CliOptions = {},
  monorepoPackageName?: string,
) => {
  const moduleName = highlightMatch(moduleOccurrences[0].name, match!);
  const buildedOccurrences = moduleOccurrences.map((m) =>
    buildWithAncestors(m, {
      noColor,
      remote,
    }),
  );

  let latestInfo = '';

  if (remote) {
    const latest = moduleOccurrences[0].latestVersion;
    const lastModified = moduleOccurrences[0].lastModified;
    latestInfo = chalk.green.dim(` ${latest} ↰ ${formatTime(lastModified)}`);
  }

  const packageInfo = {
    label: chalk.underline(moduleName) + latestInfo,
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
