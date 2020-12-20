import fs from 'fs';
import path from 'path';
import { PackageJson } from 'type-fest';
import { readLinkSilent } from '../utils';
import Workspace from './workspace';

export default class NodeModule {
  name: string;
  nodeModulesPath: string;
  parent?: NodeModule;
  _packageJson: PackageJson | null;
  workspace: Workspace;
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

  get version(): string {
    if (!this.packageJson.version) {
      throw new Error(`No version property for package ${this.name}`);
    }

    return this.packageJson.version;
  }

  get path() {
    return path.join(this.nodeModulesPath, this.name);
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

  addYarnRequiredByDependency(moduleName: string) {
    if (!this._yarnRequiredBy) {
      this._yarnRequiredBy = new Set();
    }

    this._yarnRequiredBy.add(moduleName);
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
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Couldn't find "package.json" for module ${this.name}`);
      }

      throw error;
    }
  }
}
