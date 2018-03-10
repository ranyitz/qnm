const fs = require('fs');
const path = require('path');
const NodeModule = require('./node-module');
const flattenDeep = require('lodash/flattenDeep');

const isNotHiddenDirectory = dirname => !dirname.startsWith('.');
const isScope = dirname => dirname.startsWith('@');

class ModulesMap extends Map {
  constructor({ root }) {
    super();
    this.root = root;
  }

  addModule(name, nodeModule) {
    if (!this.has(name)) {
      this.set(name, [nodeModule]);
      return;
    }

    this.get(name).push(nodeModule);
  }

  getModuleOccurrences(name) {
    const moduleOccurrences = this.get(name);

    if (!moduleOccurrences) {
      throw new Error(`The node module "${name}" does not exist in ${this.root}`);
    }

    return moduleOccurrences.map(m => m.load());
  }

  static loadSync(cwd) {
    const modulesMap = new ModulesMap({ root: cwd });

    function traverseNodeModules(root, parent) {
      const nodeModulesPath = path.resolve(root, 'node_modules');

      if (fs.existsSync(nodeModulesPath)) {
        const modulesNames = fs.readdirSync(nodeModulesPath).filter(isNotHiddenDirectory);

        flattenDeep(modulesNames.map((name) => {
          if (isScope(name)) {
            const subScopeModules = fs.readdirSync(path.join(nodeModulesPath, name));

            return subScopeModules.map((subName) => {
              const fullName = path.join(name, subName);
              const nodeModule = new NodeModule({ nodeModulesPath, name: fullName, parent });
              modulesMap.addModule(fullName, nodeModule);
              return nodeModule;
            });
          }

          const nodeModule = new NodeModule({ nodeModulesPath, name, parent });
          modulesMap.addModule(name, nodeModule);
          return nodeModule;
        })).forEach(nodeModule => traverseNodeModules(nodeModule.path, nodeModule));
      }
    }

    traverseNodeModules(cwd);
    return modulesMap;
  }
}

module.exports = ModulesMap;
