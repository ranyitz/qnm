const fs = require('fs');
const path = require('path');

module.exports = class NodeModule {
  constructor({ packageJson, nodeModulesRoot, name }) {
    this.name = name;
    this.packageJson = packageJson;
    this.nodeModulesRoot = nodeModulesRoot;
  }

  get version() {
    return this.packageJson.version;
  }

  static load() {
    // TODO
  }

  static loadSync(nodeModulesRoot, name) {
    const packageJsonPath = path.resolve(nodeModulesRoot, name, 'package.json');
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      return new NodeModule({ packageJson, nodeModulesRoot, name });
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Couldn't find "package.json" in path ${packageJsonPath}`);
      }

      throw error;
    }
  }
};

