/* eslint-disable no-console */
const opn = require('opn');
const path = require('path');
const prompts = require('prompts');
const chalk = require('chalk');
const consoleHelpers = require('./console');

const opnOptions = { wait: false };
const getPkgJsonPath = (nodeModulesPath, packageName) =>
  path.join(nodeModulesPath, packageName, 'package.json');

module.exports = function openPackage(moduleOccurrences, root) {
  if (moduleOccurrences.length === 1) {
    const { nodeModulesPath, name: packageName } = moduleOccurrences[0];
    const packageJsonPath = getPkgJsonPath(nodeModulesPath, packageName);

    return opn(packageJsonPath, opnOptions);
  }

  const choices = moduleOccurrences.map(
    ({ nodeModulesPath, version, name: packageName }) => {
      const absolutePath = getPkgJsonPath(nodeModulesPath, packageName);
      const relativePath = path.relative(root, absolutePath);

      return {
        title: `${relativePath} - ${chalk.yellow(version)}`,
        value: absolutePath,
      };
    },
  );

  consoleHelpers.clear();

  return prompts({
    type: 'select',
    name: 'value',
    message: 'Pick a package',
    choices,
    initial: 0,
  })
    .then(({ value: packageJsonPath }) => {
      return opn(packageJsonPath, opnOptions);
    })
    .catch(() => {
      console.log('');
      console.log('Operation aborted');
    });
};
