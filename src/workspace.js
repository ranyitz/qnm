const ModulesMap = require('./modules-map');

module.exports = class Workspace {
  constructor({ root, modulesMap, logger }) {
    this.root = root;
    this.modulesMap = modulesMap;
    this.logger = logger;
  }

  getVersion(packageName) {
    return this.modulesMap.getModule(packageName).version;
  }

  static load(from) {
    // TODO
    // implement
  }

  static loadSync({ cwd = process.cwd(), logger }) {
    // TODO
    // identify nodeModules recursivly
    const modulesMap = ModulesMap.loadSync(cwd);
    return new Workspace({ cwd, modulesMap, logger });
  }
};
