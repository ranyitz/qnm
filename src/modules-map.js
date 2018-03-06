const fs = require('fs');
const path = require('path');
const NodeModule = require('./node-module');

const isNotHiddenDirectory = dirname => !dirname.startsWith('.');

module.exports = class ModulesMap extends Map {
  constructor({ rawModulesMap, root }) {
    super(rawModulesMap);
    this.root = root;
  }

  getModule(name) {
    const m = this.get(name);

    if (!m) {
      throw new Error(`The node module "${name}" does not exist in ${this.root}`);
    }

    return m;
  }

  static loadSync(root) {
    const nodeModulesRoot = path.resolve(root, 'node_modules');

    try {
      const modulesNames = fs.readdirSync(nodeModulesRoot).filter(isNotHiddenDirectory);

      const rawModulesMap = modulesNames.map(name =>
        [name, new NodeModule({ nodeModulesRoot, name })]);

      return new ModulesMap({ rawModulesMap, root: nodeModulesRoot });
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`couldn't find node_modules directory in path ${root}`);
      }

      throw error;
    }
  }
};
