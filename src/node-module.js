const fs = require('fs');
const path = require('path');

module.exports = class NodeModule {
  constructor({ nodeModulesRoot, name }) {
    this.name = name;
    this.nodeModulesRoot = nodeModulesRoot;
    this._packageJson = null;
  }

  get packageJson() {
    if (!this._packageJson) {
      this.loadPackageJson();
    }

    return this._packageJson;
  }

  get version() {
    return this.packageJson.version;
  }

  loadPackageJson() {
    const packageJsonPath = path.resolve(this.nodeModulesRoot, this.name, 'package.json');
    try {
      this._packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Couldn't find "package.json" for module ${this.name}`);
      }

      throw error;
    }
  }
};

