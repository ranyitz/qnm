const path = require('path');
const ModulesMap = require('./modules-map');
const pkgDir = require('pkg-dir');

module.exports = class Workspace {
  constructor({ root, modulesMap }) {
    this.root = root;
    this.modulesMap = modulesMap;
  }

  getModuleOccurrences(packageName) {
    try {
      return this.modulesMap.getModuleOccurrences(packageName);
    } catch (err) {
      return [];
    }
  }

  list() {
    return Array.from(this.modulesMap);
  }

  getModulesNames() {
    return Array.from(this.modulesMap.keys());
  }

  match(str) {
    return this.list().filter(([name]) => name.includes(str));
  }

  listDependencies() {
    const rootDir = path.resolve(this.root, 'package.json');
    /* eslint-disable global-require */
    /* eslint-disable import/no-dynamic-require */
    const pJson = require(rootDir);
    // TODO need add method output array or object
    console.log(
      'devDependencies',
      pJson.devDependencies,
      'dependencies',
      pJson.dependencies,
    );
    return Array.from();
  }

  static loadSync(cwd) {
    const root = pkgDir.sync(cwd);

    if (root === null) {
      throw new Error('could not identify package directory');
    }

    const modulesMap = ModulesMap.loadSync(root);
    return new Workspace({ root, modulesMap });
  }
};
