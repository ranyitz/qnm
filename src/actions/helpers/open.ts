import path from 'path';
import open from 'open';
import chalk from 'chalk';
import prompts from 'prompts';
import NodeModule from '../../workspace/node-module';
import { clearTerminal } from './terminal';

const openOptions = { wait: false };

const getPkgJsonPath = (nodeModulesPath: string, packageName: string) =>
  path.join(nodeModulesPath, packageName, 'package.json');

export default function openPackage(
  moduleOccurrences: Array<NodeModule>,
  root: string
) {
  if (moduleOccurrences.length === 1) {
    const { nodeModulesPath, name: packageName } = moduleOccurrences[0];
    const packageJsonPath = getPkgJsonPath(nodeModulesPath, packageName);

    return open(packageJsonPath, openOptions);
  }

  const choices = moduleOccurrences.map(
    ({ nodeModulesPath, version, name: packageName }) => {
      const absolutePath = getPkgJsonPath(nodeModulesPath, packageName);
      const relativePath = path.relative(root, absolutePath);

      return {
        title: `${relativePath} - ${chalk.yellow(version)}`,
        value: absolutePath,
      };
    }
  );

  clearTerminal();

  return prompts({
    type: 'select',
    name: 'value',
    message: 'Pick a package',
    choices,
    initial: 0,
  })
    .then(({ value: packageJsonPath }) => {
      return open(packageJsonPath, openOptions);
    })
    .catch(() => {
      console.log('');
      console.log('Operation aborted');
    });
}
