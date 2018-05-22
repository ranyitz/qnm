const chalk = require('chalk');

const moduleMap = {};

const colors = [
  chalk.hex('#48b051'),
  chalk.hex('#00adf4'),
  chalk.hex('#ff4a07'),
  chalk.hex('#ffbf00'),
  chalk.hex('#9d26b0'),
  chalk.hex('#aad4ad'),
  chalk.hex('#00bfd6'),
  chalk.hex('#76aed5'),
  chalk.hex('#f88c8d'),
  chalk.hex('#ffd27f'),
];

const renderVersion = (moduleName, version) => {
  if (!moduleMap[moduleName]) {
    moduleMap[moduleName] = {};
  }

  const versionMap = moduleMap[moduleName];
  let color = versionMap[version];

  if (!color) {
    color = colors[Object.keys(versionMap).length] || (input => input);
    versionMap[version] = color;
  }

  return color(version);
};

module.exports = renderVersion;
