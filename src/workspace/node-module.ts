import fs, { Stats } from 'fs';
import path from 'path';
import { PackageJson } from 'type-fest';
import getFolderSize from 'get-folder-size';
import { readLinkSilent, npmView, simplifyRequiredByInfo } from '../utils';
import Workspace from './workspace';
import semverMaxSatisfying from 'semver/ranges/max-satisfying';
import semver from 'semver';

// fs.realpathSync is 70x slower than fs.realpathSync.native:
// https://github.com/nodejs/node/issues/2680
// However, `fs.realpathSync.native` resolves differently in
// Windows network drive, causing file read errors
const fsRealpathSync =
  process.platform === 'win32' ? fs.realpathSync : fs.realpathSync.native;

export type RemoteData = {
  time: Record<string | 'modified' | 'created', string>;
  versions: Array<string>;
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
  _path: string | null;
  _realpath: string | null;
  _yarnRequiredBy: Set<string> | null;
  _symlink: string | null;
  _maxVersionInSameMajor: string | null;

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
    this._path = null;
    this._realpath = null;
    this._remoteData = null;
    this._packageJson = null;
    this._yarnRequiredBy = null;
    this._symlink = null;
    this._maxVersionInSameMajor = null;
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
    if (!this._path) {
      this._path = path.join(this.nodeModulesPath, this.name);
    }
    return this._path;
  }

  get realpath() {
    if (!this._realpath) {
      try {
        this._realpath = fsRealpathSync(this.path);
      } catch (e: any) {
        // When using npm "overwrites" with "@favware/skip-dependency", there could be modules
        // that have symlinks to non-existing paths, causing an ENOENT error. Falling back to
        // the path when this happen.
        if ('code' in e && e.code === 'ENOENT') {
          this._realpath = this.path;
        }
        throw e;
      }
    }

    return this._realpath;
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

  get latestLastModified(): Date {
    return new Date(this.remoteData.time[this.latestVersion]);
  }

  get maxVersionInSameMajor(): string | null {
    if (!this._maxVersionInSameMajor) {
      this._maxVersionInSameMajor = semverMaxSatisfying(
        this.remoteData.versions,
        `^${semver.clean(this.version)}`
      );
    }
    return this._maxVersionInSameMajor;
  }

  get maxVersionInSameMajorLastModified(): Date | null {
    if (!this.maxVersionInSameMajor) return null;

    return new Date(this.remoteData.time[this.maxVersionInSameMajor]);
  }

  get releaseDate(): Date {
    if (!this.packageJson.version) {
      throw new Error(
        `missing "version" in package.json for module: ${this.path}`
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

  /**
   * return the size of the modules in mb
   */
  getSize(): Promise<number> {
    return new Promise((resolve) => {
      getFolderSize(this.path, (err, size) => {
        if (err) {
          console.error(err);
        }

        resolve(Number((size / 1024 / 1024).toFixed(2)));
      });
    });
  }

  get isResolutions(): boolean {
    const resolutions = this.workspace?.resolutionsList;
    if (!Array.isArray(resolutions)) {
      return false;
    }

    return resolutions.includes(this.name);
  }

  get isbundledDependency() {
    const bundledDependencies = this.parent?.packageJson.bundledDependencies;
    const bundleDependencies = this.parent?.packageJson.bundleDependencies;

    if (
      !Array.isArray(bundledDependencies) &&
      !Array.isArray(bundleDependencies)
    ) {
      return false;
    }

    return (
      bundledDependencies?.includes(this.name) ||
      bundleDependencies?.includes(this.name)
    );
  }

  get whyInfo() {
    const requiredByInfo = this.requiredBy;

    if (requiredByInfo) {
      return simplifyRequiredByInfo(this.name, requiredByInfo);
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
