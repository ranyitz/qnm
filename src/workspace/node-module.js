const fs = require('fs');
const path = require('path');

module.exports = class NodeModule {
  constructor({ nodeModulesPath, name, parent }) {
    this.name = name;
    this.nodeModulesPath = nodeModulesPath;
    this.parent = parent;
    this._packageJson = null;
  }

  get packageJson() {
    if (!this._packageJson) {
      this.load();
    }

    return this._packageJson;
  }

  get version() {
    return this.packageJson.version;
  }

  get path() {
    return path.join(this.nodeModulesPath, this.name);
  }

  toObject() {
    return {
      name: this.name,
      path: this.path,
      version: this.version,
      parent: this.parent && this.parent.toObject(),
    };
  }

  load() {
    const packageJsonPath = path.resolve(this.nodeModulesPath, this.name, 'package.json');

    try {
      this._packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      return this;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Couldn't find "package.json" for module ${this.name}`);
      }

      throw error;
    }
  }
};

