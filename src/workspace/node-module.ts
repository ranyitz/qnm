import fs from 'fs';
import path from 'path';
import { PackageJson } from 'type-fest';

export default class NodeModule {
  name: string;
  nodeModulesPath: string;
  parent?: NodeModule;
  _packageJson: PackageJson | null;

  constructor({
    nodeModulesPath,
    name,
    parent,
  }: {
    nodeModulesPath: string;
    name: string;
    parent?: NodeModule;
  }) {
    this.name = name;
    this.nodeModulesPath = nodeModulesPath;
    this.parent = parent;
    this._packageJson = null;
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

  get whyInfo() {
    const requiredByInfo = this.packageJson._requiredBy as Array<string>;

    if (requiredByInfo) {
      return requiredByInfo.map(modulePath => {
        if (modulePath === '/') {
          return 'dependencies';
        } else if (modulePath === '#DEV:/') {
          return 'devDependencies';
        } else if (modulePath === '#USER') {
          return `npm install ${this.name}`;
        }

        return modulePath.slice(1);
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
    const packageJsonPath = path.resolve(
      this.nodeModulesPath,
      this.name,
      'package.json',
    );

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
