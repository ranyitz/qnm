import fs from 'fs';
import path from 'path';
import pkgDir from 'pkg-dir';
import { PackageJson } from 'type-fest';
import { parse as parseYarnLock } from '@yarnpkg/lockfile';
import globby from 'globby';
import { isTruthy } from '../utils';
import ModulesMap from './modules-map';
import NodeModule from './node-module';

type Workspaces =
  | Array<string>
  | { packages: Array<string> | undefined }
  | undefined;

type YarnLock = Record<
  string,
  { version: string; dependencies: Record<string, string> }
>;

export default class Workspace {
  root: string;
  packages: Array<Workspace>;
  _modulesMap: ModulesMap | null;
  _packageJson: PackageJson | null;
  _isYarn: boolean | null;
  _yarnLock: YarnLock | null;
  _isMonorepo: boolean | null;

  constructor({ root }: { root: string }) {
    this.root = root;
    this._modulesMap = null;
    this._packageJson = null;
    this._yarnLock = null;
    this._isYarn = null;
    this._isMonorepo = null;
    this.packages = [];
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

  get yarnLock(): YarnLock {
    const yarnLockPath = path.join(this.root, 'yarn.lock');
    const rawYarnLock = fs.readFileSync(yarnLockPath, 'utf8');
    const yarnLock = parseYarnLock(rawYarnLock).object as YarnLock;
    this._yarnLock = yarnLock;

    return yarnLock;
  }

  get name() {
    return this.packageJson.name;
  }

  get isMonorepo(): boolean {
    if (this._isMonorepo === null) {
      const lernaJsonPath = path.join(this.root, 'lerna.json');
      this._isMonorepo = fs.existsSync(lernaJsonPath);
    }

    return this._isMonorepo;
  }

  get isYarn(): boolean {
    try {
      if (this.yarnLock) {
        this._isYarn = true;
      }
    } catch (error) {
      this._isYarn = false;
    }

    return this._isYarn!;
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

  getPackagesModuleOccurrences(
    packageName: string,
  ): Array<[string, Array<NodeModule>]> {
    return this.packages
      .map(packageWorkspace => {
        try {
          return [
            packageWorkspace.name,
            packageWorkspace.modulesMap.getModuleOccurrences(packageName),
          ] as [string, Array<NodeModule>];
        } catch (error) {
          return null;
        }
      })
      .filter(isTruthy);
  }

  matchPackagesModuleOccurrences(
    str: string,
  ): Array<[string, Array<[string, Array<NodeModule>]>]> {
    return this.packages
      .map(packageWorkspace => {
        try {
          return [packageWorkspace.name, packageWorkspace.match(str)] as [
            string,
            Array<[string, Array<NodeModule>]>,
          ];
        } catch (error) {
          return null;
        }
      })
      .filter(isTruthy);
  }

  list() {
    return Array.from(this.modulesMap);
  }

  listPackagesModuleOccurrences() {
    return this.packages
      .map(packageWorkspace => {
        try {
          return [packageWorkspace.name!, packageWorkspace.list()] as [
            string,
            Array<[string, Array<NodeModule>]>,
          ];
        } catch (error) {
          return null;
        }
      })
      .filter(isTruthy);
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

  loadMonorepoPackages(): void {
    const lernaJsonPath = path.join(this.root, 'lerna.json');
    const lernaJson = JSON.parse(fs.readFileSync(lernaJsonPath, 'utf8'));

    let packages = lernaJson.packages;

    if (lernaJson.useWorkspaces === true) {
      const workspaces = this.packageJson.workspaces as Workspaces;

      if (!Array.isArray(workspaces)) {
        packages = workspaces?.packages;
      } else {
        packages = workspaces;
      }
    }

    if (!packages) {
      console.warn('No packages found for monorepo');
      console.warn(`packages data wasn't loaded`);
    }

    globby
      .sync(packages, {
        absolute: true,
        onlyDirectories: true,
      })
      .forEach(location => {
        try {
          this.packages.push(Workspace.loadSync(location, false));
        } catch (error) {}
      });
  }

  static loadSync(cwd = process.cwd(), traverse = true): Workspace {
    const root = traverse ? pkgDir.sync(cwd) : cwd;

    if (!root) {
      throw new Error('could not identify package directory');
    }

    const nodeModulesPath = path.join(root, 'node_modules');

    if (!fs.existsSync(nodeModulesPath)) {
      throw new Error('could not find node_modules directory');
    }

    const workspace = new Workspace({ root });

    if (workspace.isMonorepo) {
      workspace.loadMonorepoPackages();
    }

    return workspace;
  }
}
