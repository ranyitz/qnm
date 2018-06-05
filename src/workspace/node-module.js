const fs = require('fs');
const path = require('path');
const flattenDeep = require('lodash/flattenDeep');

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

  get deepWhyInfo() {
    const getWhyModules = (whyModulesNames, parentName) => {
      return flattenDeep(
        whyModulesNames.map(name => {
          const moduleOccurrences = this.modulesMap.get(name);
          if (!moduleOccurrences || moduleOccurrences.length === 0) return [];

          return moduleOccurrences
            .filter(nodeModule => {
              // only use modules which are top level or children of the passed parent name
              return (
                !nodeModule.parent || nodeModule.parent.name === parentName
              );
            })
            .map(nodeModule => ({
              label: nodeModule.name,
              whyInfo: nodeModule.whyInfo,
            }));
        }),
      );
    };

    const nodes = getWhyModules(this.whyInfo, this.name);
    let modulesQueue = nodes.slice(0);

    if (modulesQueue.length === 0) return this.whyInfo;

    // populate rest of the modules
    for (const m of modulesQueue) {
      const whyModules = getWhyModules(m.whyInfo, m.label);
      m.nodes = whyModules;
      modulesQueue = modulesQueue.concat(whyModules);
    }

    const whyTree = {
      name: this.name,
      nodes,
    };

    return whyTree;
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
