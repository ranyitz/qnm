const chalk = require('chalk');

const moduleMap = {};
const colors = [
  chalk.white,
  chalk.hex('#9de5f7'),
  chalk.hex('#66b5f9'),
  chalk.hex('#00adf4'),
  chalk.hex('#0082f4'),
  chalk.hex('#8868f9'),
  chalk.hex('#792bf7'),
  chalk.hex('#ad7bfc'),
  chalk.hex('#ce75f4'),
  chalk.hex('#f993e5'),
  chalk.hex('#f4a4d0'),
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
//# sourceMappingURL=render-version.js.map
