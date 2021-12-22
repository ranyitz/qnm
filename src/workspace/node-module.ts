import fs, { Stats } from 'fs';
import path from 'path';
import { PackageJson } from 'type-fest';
import { readLinkSilent, npmView } from '../utils';
import Workspace from './workspace';

export type RemoteData = {
  time: Record<string | 'modified' | 'created', string>;
  'dist-tags': Record<'latest' | string, string>;
};

export default class NodeModule {
  name: string;
  nodeModulesPath: string;
  parent?: NodeModule;
  workspace: Workspace;
  _remoteData: RemoteData | null;
  _packageJson: PackageJson | null;
  _stats: Stats | null;
  _yarnRequiredBy: Set<string> | null;
  _symlink: string | null;

  constructor({
    nodeModulesPath,
    name,
    parent,
    workspace,
  }: {
    nodeModulesPath: string;
    name: string;
    parent?: NodeModule;
    workspace: Workspace;
  }) {
    this.name = name;
    this.nodeModulesPath = nodeModulesPath;
    this.parent = parent;
    this.workspace = workspace;
    this._stats = null;
    this._remoteData = null;
    this._packageJson = null;
    this._yarnRequiredBy = null;
    this._symlink = null;
  }

  get packageJson(): PackageJson {
    if (!this._packageJson) {
      return this.load();
    }

    return this._packageJson;
  }

  get remoteData(): RemoteData {
    if (!this._remoteData) {
      return this.loadRemoteData();
    }

    return this._remoteData;
  }

  get version(): string {
    if (!this.packageJson.version) {
      throw new Error(`No version property for package ${this.name}`);
    }

    return this.packageJson.version;
  }

  get path() {
    return path.join(this.nodeModulesPath, this.name);
  }

  get stats() {
    if (!this._stats) {
      this._stats = fs.statSync(this.path);
    }

    return this._stats;
  }

  get symlink() {
    if (!this._symlink) {
      const modulePath = path.join(this.nodeModulesPath, this.name);
      this._symlink = readLinkSilent(modulePath);
    }

    return this._symlink;
  }

  get requiredBy(): Array<string> {
    if ((this.packageJson as any)._requiredBy) {
      return (this.packageJson as any)._requiredBy as Array<string>;
    }

    if (this.workspace.isYarn) {
      this.workspace.modulesMap.assignYarnRequiredBy();

      if (this._yarnRequiredBy) {
        return [...this._yarnRequiredBy!];
      }
    }

    return [];
  }

  get latestVersion(): string {
    return this.remoteData['dist-tags'].latest;
  }

  get lastModified(): Date {
    return new Date(this.remoteData.time.modified);
  }

  get releaseDate(): Date {
    if (!this.packageJson.version) {
      throw new Error(
        `missing "version" in package.json for module: ${this.path}`,
      );
    }

    return new Date(this.remoteData.time[this.packageJson.version]);
  }

  loadRemoteData() {
    this._remoteData = npmView(this.name);
    return this._remoteData;
  }

  addYarnRequiredByDependency(moduleName: string) {
    if (!this._yarnRequiredBy) {
      this._yarnRequiredBy = new Set();
    }

    this._yarnRequiredBy.add(moduleName);
  }

  get isbundledDependency() {
    if (
      !Array.isArray(this.parent?.packageJson.bundledDependencies) &&
      !Array.isArray(this.parent?.packageJson.bundleDependencies)
    ) {
      return false;
    }

    return (
      this.parent?.packageJson.bundledDependencies?.includes(this.name) ||
      this.parent?.packageJson.bundleDependencies?.includes(this.name)
    );
  }

  get whyInfo() {
    const requiredByInfo = this.requiredBy;

    if (requiredByInfo) {
      return requiredByInfo.map((modulePath) => {
        if (modulePath === '/') {
          return 'dependencies';
        } else if (modulePath === '#DEV:/') {
          return 'devDependencies';
        } else if (modulePath === '#USER') {
          return `npm install ${this.name}`;
        }

        // npm sometimes starts with requiredBy with `/`
        return modulePath.startsWith('/') ? modulePath.slice(1) : modulePath;
      });
    }

    return [];
  }

  toObject(): Record<string, any> {
    return {
      name: this.name,
      path: this.path,
      version: this.version,
      parent: this.parent && this.parent.toObject(),
    };
  }

  load(): PackageJson {
    const modulePath = path.join(this.nodeModulesPath, this.name);
    const packageJsonPath = path.join(modulePath, 'package.json');

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
}
