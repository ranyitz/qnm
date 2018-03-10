const ModulesMap = require('./modules-map');
const pkgDir = require('pkg-dir');

module.exports = class Workspace {
  constructor({ cwd, modulesMap }) {
    this.cwd = cwd;
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

  static loadSync(cwd) {
    const root = pkgDir.sync(cwd);

    if (root === null) {
      throw new Error('could not identify package directory');
    }

    const modulesMap = ModulesMap.loadSync(root);
    return new Workspace({ cwd, modulesMap });
  }
};
