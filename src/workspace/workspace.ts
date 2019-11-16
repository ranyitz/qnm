import fs from 'fs';
import path from 'path';
import pkgDir from 'pkg-dir';
import { PackageJson } from 'type-fest';
import { parse as parseYarnLock } from '@yarnpkg/lockfile';
import ModulesMap from './modules-map';
import NodeModule from './node-module';

type YarnLock = Record<
  string,
  { version: string; dependencies: Record<string, string> }
>;

export default class Workspace {
  root: string;
  _modulesMap: ModulesMap | null;
  _packageJson: PackageJson | null;
  _yarnLock: YarnLock | null;

  constructor({ root }: { root: string }) {
    this.root = root;
    this._modulesMap = null;
    this._packageJson = null;
    this._yarnLock = null;
  }

  get modulesMap(): ModulesMap {
    if (!this._modulesMap) {
      this._modulesMap = ModulesMap.loadSync(this.root, this);

      if (this._modulesMap.size === 0) {
        throw new Error('node_modules directory is empty');
      }
    }

    return this._modulesMap;
  }

  get packageJson(): PackageJson {
    if (!this._packageJson) {
      return this.loadPackageJson();
    }

    return this._packageJson;
  }

  get yarnLock(): YarnLock | null {
    const yarnLockPath = path.join(this.root, 'yarn.lock');

    try {
      const rawYarnLock = fs.readFileSync(yarnLockPath, 'utf8');
      const yarnLock = parseYarnLock(rawYarnLock).object as YarnLock;
      this._yarnLock = yarnLock;
      return yarnLock;
    } catch (e) {
      console.warn(`cannot get "why" information for ${this.name}`);
      console.warn(e);
      return null;
    }
  }

  get name() {
    return this.packageJson.name;
  }

  loadPackageJson(): PackageJson {
    const packageJsonPath = path.join(this.root, 'package.json');

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

    return new Workspace({ root });
  }
}
