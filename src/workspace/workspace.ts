import fs from 'fs';
import path from 'path';
import pkgDir from 'pkg-dir';
import { PackageJson } from 'type-fest';
import ModulesMap from './modules-map';
import NodeModule from './node-module';

export default class Workspace {
  root: string;
  modulesMap: ModulesMap;
  _packageJson: PackageJson | null;

  constructor({ root, modulesMap }: { root: string; modulesMap: ModulesMap }) {
    this.root = root;
    this.modulesMap = modulesMap;
    this._packageJson = null;
  }

  get packageJson(): PackageJson {
    if (!this._packageJson) {
      return this.loadPackageJson();
    }

    return this._packageJson;
  }

  get name() {
    return this.packageJson.name;
  }

  loadPackageJson(): PackageJson {
    const packageJsonPath = path.resolve(this.root, 'package.json');

    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      this._packageJson = pkg;
      return pkg;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Couldn't find "package.json" for module ${this.name}`);
      }

      throw error;
    }
  }

  getModuleOccurrences(packageName: string) {
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

    const dependenciesMap = new Map<string, Array<NodeModule>>();

    for (const dependency in dependencies) {
      dependenciesMap.set(dependency, this.modulesMap.get(dependency)!);
    }

    return Array.from(dependenciesMap);
  }

  match(str: string) {
    return this.list().filter(([name]) => name.includes(str));
  }

  static loadSync(cwd = process.cwd()): Workspace {
    const root = pkgDir.sync(cwd);

    if (!root) {
      throw new Error('could not identify package directory');
    }

    const nodeModulesPath = path.join(root, 'node_modules');

    if (!fs.existsSync(nodeModulesPath)) {
      throw new Error('could not find node_modules directory');
    }

    const modulesMap = ModulesMap.loadSync(root);

    if (modulesMap.size === 0) {
      throw new Error('node_modules directory is empty');
    }

    return new Workspace({ root, modulesMap });
  }
}
