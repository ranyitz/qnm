const ModulesMap = require('./modules-map');
const pkgDir = require('pkg-dir');
const path = require('path');
const fs = require('fs');

module.exports = class Workspace {
  constructor({ root, modulesMap }) {
    this.root = root;
    this.modulesMap = modulesMap;
    this._packageJson = null;
  }

  get packageJson() {
    if (!this._packageJson) {
      this.loadPackageJson();
    }

    return this._packageJson;
  }

  loadPackageJson() {
    const packageJsonPath = path.resolve(this.root, 'package.json');

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

  getModuleOccurrences(packageName) {
    try {
      return this.modulesMap.getModuleOccurrences(packageName);
    } catch (err) {
      return [];
    }
  }

  list() {
    return Array.from(this.modulesMap);
  }

  getModulesNames() {
    return Array.from(this.modulesMap.keys());
  }

  listPackageJsonDependencies() {
    const dependencies = Object.assign(
      {},
      this.packageJson.dependencies,
      this.packageJson.devDependencies,
    );
    const dependenciesMap = new Map();

    for (const dependency in dependencies) {
      dependenciesMap.set(dependency, this.modulesMap.get(dependency));
    }

    return Array.from(dependenciesMap);
  }

  match(str) {
    return this.list().filter(([name]) => name.includes(str));
  }

  static loadSync(cwd) {
    const root = pkgDir.sync(cwd);

    if (root === null) {
      throw new Error('could not identify package directory');
    }

    const modulesMap = ModulesMap.loadSync(root);
    return new Workspace({ root, modulesMap });
  }
};
