const ModulesMap = require('./modules-map');

module.exports = class Workspace {
  constructor({ cwd, modulesMap }) {
    this.cwd = cwd;
    this.modulesMap = modulesMap;
  }

  get(packageName) {
    return this.modulesMap.getModule(packageName);
  }

  static loadSync({ cwd = process.cwd() } = {}) {
    // TODO
    // identify nodeModules recursivly
    const modulesMap = ModulesMap.loadSync(cwd);
    return new Workspace({ cwd, modulesMap });
  }
};
