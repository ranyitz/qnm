const fs = require('fs');
const path = require('path');
const flattenDeep = require('lodash/flattenDeep');

function buildWhyTree(whyInfo, modulesMap) {
  return flattenDeep(
    whyInfo.map(whyModuleName => {
      if (!modulesMap.has(whyModuleName)) {
        return { name: whyModuleName, whyList: [] };
      }

      const firstWhyModuleOccurences = modulesMap.get(whyModuleName);
      return firstWhyModuleOccurences.map(m => {
        return { name: m.name, whyList: m.whyInfo };
      });
    }),
  );
}
module.exports = class NodeModule {
  constructor({ nodeModulesPath, name, parent, modulesMap }) {
    this.name = name;
    this.modulesMap = modulesMap;
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
      const whyInfo = requiredByInfo.map(modulePath => {
        if (modulePath === '/') {
          return 'dependencies';
        } else if (modulePath === '#DEV:/') {
          return 'devDependencies';
        } else if (modulePath === '#USER') {
          return `npm install ${this.name}`;
        }

        return modulePath.slice(1);
      });

      return buildWhyTree(whyInfo, this.modulesMap);
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
};
