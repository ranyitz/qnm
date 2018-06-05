const fs = require('fs');
const path = require('path');
const flattenDeep = require('lodash/flattenDeep');
const uniq = require('lodash/uniq');
const head = require('lodash/head');

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
      return uniq(
        requiredByInfo.map(modulePath => {
          const moduleName = modulePath.slice(1);
          if (modulePath === '/') {
            return 'dependencies';
          } else if (modulePath === '#DEV:/') {
            return 'devDependencies';
          } else if (modulePath === '#USER') {
            return `npm install ${this.name}`;
          } else if (
            moduleName.indexOf('/') > 0 &&
            !moduleName.startsWith('@')
          ) {
            return moduleName.slice(moduleName.indexOf('/') + 1);
          }

          return moduleName;
        }),
      );
    }

    return [];
  }

  getDeepWhyInfo(maxDepth = Infinity) {
    const getWhyModules = (
      whyModulesNames,
      parentName,
      depth = 1,
      ancestors = [],
    ) => {
      return flattenDeep(
        whyModulesNames.map(name => {
          // naivly take only the first one assuming they have the same why info
          const nodeModule = head(this.modulesMap.get(name));
          if (!nodeModule) {
            return [{ label: name, nodes: [], whyInfo: [], depth }];
          }

          return {
            label: nodeModule.name,
            whyInfo: nodeModule.whyInfo,
            ancestors: ancestors.concat(parentName),
            depth,
          };
        }),
      );
    };

    const nodes = getWhyModules(this.whyInfo, this.name);
    const modulesSet = new Set(nodes.slice(0));

    if (modulesSet.length === 0) return this.whyInfo;

    // populate rest of the modules
    for (const m of modulesSet) {
      // do not analyze child when you got to max depth
      if (m.depth !== maxDepth) {
        const whyModules = getWhyModules(
          m.whyInfo,
          m.label,
          m.depth + 1,
          m.ancestors,
        );

        m.nodes = whyModules.filter(whyModule => {
          // to avoid circular dependencies
          if (!m.ancestors.includes(whyModule.label)) {
            modulesSet.add(whyModule);
            return true;
          }

          return false;
        });
      }
    }

    const whyTree = {
      label: this.name,
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
