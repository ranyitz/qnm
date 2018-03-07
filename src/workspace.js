const ModulesMap = require('./modules-map');
const pkgDir = require('pkg-dir');

module.exports = class Workspace {
  constructor({ cwd, modulesMap }) {
    this.cwd = cwd;
    this.modulesMap = modulesMap;
  }

  get(packageName) {
    return this.modulesMap.getModule(packageName);
  }

  list() {
    return Array.from(this.modulesMap);
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
