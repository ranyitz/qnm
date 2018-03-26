const fs = require('fs');
const path = require('path');

class NodeModule {
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

  get whyInfo() {
    const requiredByInfo = this.packageJson._requiredBy;

    if (requiredByInfo) {
      return requiredByInfo.map(modulePath => {
        if (modulePath === '/') {
          return 'dependencies';
        } else if (modulePath === '#DEV:/') {
          return 'devDependencies';
        } else if (modulePath === '#USER') {
          return `npm install ${this.name}`;
        }

        return modulePath.slice(1);
      });
    }

    return [];
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
    const packageJsonPath = path.resolve(
      this.nodeModulesPath,
      this.name,
      'package.json',
    );

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
}

module.exports = NodeModule;
