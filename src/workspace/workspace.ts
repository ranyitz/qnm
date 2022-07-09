import fs from 'fs';
import path from 'path';
import pkgDir from 'pkg-dir';
import { PackageJson } from 'type-fest';
import { parseSyml as parseYarnLock, parseResolution } from '@yarnpkg/parsers';
import type { Resolution } from '@yarnpkg/parsers';
import YAML from 'yaml';
import globby from 'globby';
import zip from 'lodash/zip';
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

type YarnRC = {
  nodeLinker?: string;
};

export default class Workspace {
  root: string;
  packages: Array<Workspace>;
  _parentMonorepo: Workspace | null = null;
  _modulesMap: ModulesMap | null = null;
  _packageJson: PackageJson | null = null;
  _isYarn: boolean | null = null;
  _isPnpm: boolean | null = null;
  _yarnLock: YarnLock | null = null;
  _yarnRC: YarnRC | null = null;
  // _pnpmLock: PnpmLockfile | null = null;
  _resolutions: Array<{ pattern: Resolution; reference: string }> | null = null;
  _resolutionsList: Array<string> | null = null;

  constructor({ root }: { root: string }) {
    this.root = root;
    this.packages = [];
  }

  get modulesMap(): ModulesMap {
    if (!this._modulesMap) {
      const nodeModulesPath = path.join(this.root, 'node_modules');

      if (!fs.existsSync(nodeModulesPath)) {
        throw new Error('could not find node_modules directory');
      }

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
    if (!this._yarnLock) {
      const yarnLockPath = path.join(this.root, 'yarn.lock');
      const rawYarnLock = fs.readFileSync(yarnLockPath, 'utf8');
      const yarnLock = parseYarnLock(rawYarnLock) as YarnLock;

      this._yarnLock = yarnLock;
    }

    return this._yarnLock;
  }

  get yarnRC(): YarnRC | null {
    if (!this._yarnRC) {
      try {
        const yarnRCPath = path.join(this.root, '.yarnrc.yml');
        const rawYarnRC = fs.readFileSync(yarnRCPath, 'utf8');
        const yarnRC = YAML.parse(rawYarnRC);
        this._yarnRC = yarnRC;
      } catch (error) {
        // There is a problem with the yarnrc read or parsing
      }
    }

    return this._yarnRC as YarnRC;
  }

  get name() {
    return this.packageJson.name;
  }

  get isPackageInMonorepo(): boolean {
    const maybeMonrepoRoot = pkgDir.sync(path.dirname(this.root));
    const maybeParentMonorepo = Workspace.loadSync({ cwd: maybeMonrepoRoot });
    const isPackageInMonorepo = maybeParentMonorepo
      .getMonorepoPackages()
      .map(path.normalize)
      .includes(this.root);

    if (isPackageInMonorepo) {
      this._parentMonorepo = maybeParentMonorepo;
    }

    return isPackageInMonorepo;
  }

  get parentMonorepo(): Workspace {
    if (this.isPackageInMonorepo) {
      return this._parentMonorepo!;
    } else {
      throw new Error('not a package in a monorepo');
    }
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

  get isPnpm(): boolean {
    if (!this._isPnpm) {
      if (fs.existsSync(path.join(this.root, 'pnpm-lock.yaml'))) {
        this._isPnpm = true;
      }
      this._isPnpm = false;

      try {
        const linker = this.yarnRC?.['nodeLinker'];
        if (linker === 'pnpm') {
          this._isPnpm = true;
        }
      } catch (error) {
        this._isPnpm = false;
      }
    }

    return this._isPnpm!;
  }

  get resolutionsList(): any {
    if (!this._resolutionsList) {
      this._resolutions = [];
      this._resolutionsList = [];

      if (
        typeof this.packageJson.resolutions === `object` &&
        this.packageJson.resolutions !== null
      ) {
        for (const [pattern, reference] of Object.entries(
          this.packageJson.resolutions
        )) {
          try {
            const parsedResolution = parseResolution(pattern);

            this._resolutions.push({
              pattern: parsedResolution,
              reference,
            });

            this._resolutionsList.push(parsedResolution.descriptor.fullName);
          } catch (error) {
            console.log('error parsing resolutions', error);
          }
        }
      }
    }

    return this._resolutionsList;
  }

  loadPackageJson(): PackageJson {
    const packageJsonPath = path.join(this.root, 'package.json');

    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      this._packageJson = pkg;
      return pkg;
    } catch (error: any) {
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
    packageName: string
  ): Array<[string, Array<NodeModule>]> {
    return this.packages
      .map((packageWorkspace) => {
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
    str: string
  ): Array<[string, Array<[string, Array<NodeModule>]>]> {
    return this.packages
      .map((packageWorkspace) => {
        try {
          return [packageWorkspace.name, packageWorkspace.match(str)] as [
            string,
            Array<[string, Array<NodeModule>]>
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

  async listHeavyModules(sortType: 'duplicates' | 'size', limit: number) {
    const promises: Array<Promise<number>> = [];
    const modules: Array<string> = [];
    const quantity: Array<number> = [];

    this.modulesMap.forEach((moduleOccurences, moduleName) => {
      promises.push(
        Promise.all(
          moduleOccurences.map((nodeModule) => nodeModule.getSize())
        ).then((arr) => +arr.reduce((x, y) => x + y, 0).toFixed(2))
      );

      modules.push(moduleName);
      quantity.push(moduleOccurences.length);
    });

    const sizes = await Promise.all(promises);
    const modulesWithSizes = zip(modules, sizes, quantity);
    return modulesWithSizes
      .sort((firstEl, secondEl) => {
        if (sortType === 'size') {
          return secondEl[1]! - firstEl[1]!;
        }

        if (sortType === 'duplicates') {
          return secondEl[2]! - firstEl[2]!;
        }

        throw new Error('this does not suppose to happen');
      })
      .slice(0, limit);
  }

  listPackagesModuleOccurrences() {
    return this.packages
      .map((packageWorkspace) => {
        try {
          return [packageWorkspace.name!, packageWorkspace.list()] as [
            string,
            Array<[string, Array<NodeModule>]>
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
    const dependencies = {
      ...this.packageJson.dependencies,
      ...this.packageJson.devDependencies,
    };

    const dependenciesMap = new Map<string, Array<NodeModule>>();

    for (const dependency in dependencies) {
      dependenciesMap.set(dependency, this.modulesMap.get(dependency)!);
    }

    return Array.from(dependenciesMap);
  }

  match(str: string) {
    return this.list().filter(([name]) => name.includes(str));
  }

  get isMonorepo(): boolean {
    const lernaJsonPath = path.join(this.root, 'lerna.json');

    return !!this.packageJson.workspaces || fs.existsSync(lernaJsonPath);
  }

  // return a list of absolute paths of packages
  getMonorepoPackages(): Array<string> {
    if (!this.isMonorepo) return [];

    let packages;

    const workspaces = this.packageJson.workspaces as Workspaces;

    // yarn workspaces
    if (workspaces) {
      if (!Array.isArray(workspaces)) {
        packages = workspaces.packages;
      } else {
        packages = workspaces;
      }
    } else {
      const lernaJsonPath = path.join(this.root, 'lerna.json');
      const lernaJson = JSON.parse(fs.readFileSync(lernaJsonPath, 'utf8'));

      packages = lernaJson.packages;
    }

    if (!packages) {
      console.warn('No packages found for monorepo');
      console.warn(`packages data wasn't loaded`);
    }

    return globby.sync(packages, {
      absolute: true,
      onlyDirectories: true,
      cwd: this.root,
    });
  }

  static loadSync({
    cwd = process.cwd(),
    traverse = true,
  }: {
    cwd?: string;
    traverse?: boolean;
  } = {}): Workspace {
    const root = traverse ? pkgDir.sync(cwd) : cwd;

    if (!root) {
      throw new Error('could not identify package directory');
    }

    const workspace = new Workspace({ root });

    return workspace;
  }
}
