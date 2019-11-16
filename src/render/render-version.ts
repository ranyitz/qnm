import chalk, { Chalk } from 'chalk';
import identity from 'lodash/identity';

type Identity<T> = (t: T) => T;

type VersionMap = Record<string, Chalk | Identity<string>>;

const moduleMap: Record<string, VersionMap> = {};

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

const renderVersion = (moduleName: string, version: string | number) => {
  if (!moduleMap[moduleName]) {
    moduleMap[moduleName] = {};
  }

  const versionMap = moduleMap[moduleName];

  let color = versionMap[version];

  if (!color) {
    color = colors[Object.keys(versionMap).length] || identity;
    versionMap[version] = color;
  }

  return color(String(version));
};

export default renderVersion;
