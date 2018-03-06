const ModulesMap = require('./modules-map');

module.exports = class NodeModules {
  constructor({ root, modulesMap }) {
    this.root = root;
    this.modulesMap = modulesMap;
  }

  getVersion(packageName) {
    return this.modulesMap.getModule(packageName).version;
  }

  static load(from) {
    // TODO
    // implement
  }

  static loadSync(cwd = process.cwd()) {
    // TODO
    // identify nodeModules recursivly
    const modulesMap = ModulesMap.loadSync(cwd);
    return new NodeModules({ cwd, modulesMap });
  }
};
