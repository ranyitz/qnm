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

const renderSymlink = (m: NodeModule): string =>
  m.symlink ? chalk.magenta(` -> ${m.symlink}`) : '';

const getVersionDiffSymbol = (
  version: string,
  latestVersion: string
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
  if (isEmpty(whyInfo) || m.parent) {
    return '';
  }

  let stringWhyInfo;

  if (whyInfo.length > 3) {
    stringWhyInfo = whyInfo.slice(0, 3).join(', ') + '...';
  } else {
    stringWhyInfo = whyInfo.join(', ');
  }

  return ` ${chalk.dim.yellow(`(${stringWhyInfo})`)}`;
};

type TreeNode = { label: string; nodes: Array<TreeNode> } | string;

const buildWithAncestors = (
  m: NodeModule,
  { noColor, remote }: CliOptions,
  cwdModuleName?: string
) => {
  const whyInfo = getWhyInfo(m);
  const version = noColor ? m.version : renderVersion(m.name, m.version);
  const versionWithLink = isTerminalLinkSupported
    ? terminalLink(version, path.join('File:///', m.path, 'package.json'))
    : version;

  const symlink = renderSymlink(m);

  const bundledDependencies = m.isbundledDependency
    ? chalk.dim.cyan(' (bundledDependencies)')
    : '';

  const resolutions = m.isResolutions ? chalk.dim.cyan(' (resolutions)') : '';

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
    versionWithLink +
    bundledDependencies +
    resolutions +
    symlink +
    versionDiffSymbol +
    releaseDate +
    whyInfo;

  let hierarchy: Array<TreeNode> = [information];

  if (m.parent) {
    let currentModule = m;

    while (currentModule.parent) {
      currentModule = currentModule.parent;

      const cwdModuleMark =
        cwdModuleName === currentModule.name ? chalk.bold` (cwd)` : '';

      hierarchy = [
        {
          label:
            chalk.dim(currentModule.name) +
            renderSymlink(currentModule) +
            cwdModuleMark,
          nodes: hierarchy,
        },
      ];
    }
  }

  return hierarchy[0];
};

export default (
  moduleOccurrences: Array<NodeModule>,
  { match, noColor, remote }: CliOptions = {},
  cwdModuleName?: string
) => {
  const moduleName = highlightMatch(moduleOccurrences[0].name, match!);

  const buildedOccurrences = moduleOccurrences.map((m) =>
    buildWithAncestors(
      m,
      {
        noColor,
        remote,
      },
      cwdModuleName
    )
  );

  let latestInfo = '';

  if (remote) {
    const {
      latestVersion,
      latestLastModified,
      maxVersionInSameMajor,
      maxVersionInSameMajorLastModified,
    } = moduleOccurrences[0];

    let maxVersionInSameMajorStr = '';

    if (
      latestVersion !== maxVersionInSameMajor &&
      maxVersionInSameMajorLastModified
    ) {
      maxVersionInSameMajorStr = ` | ${maxVersionInSameMajor} ↰ ${formatTime(
        maxVersionInSameMajorLastModified
      )}`;
    }

    latestInfo = chalk.green.dim(
      ` ${latestVersion} ↰ ${formatTime(
        latestLastModified
      )}${maxVersionInSameMajorStr}`
    );
  }

  const packageInfo = {
    label: chalk.underline(moduleName) + latestInfo,
    nodes: buildedOccurrences,
  };

  return archy(packageInfo);
};
