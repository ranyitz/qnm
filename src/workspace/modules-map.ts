import fs from 'fs';
import path from 'path';
import flattenDeep from 'lodash/flattenDeep';
import chalk from 'chalk';
import NodeModule from './node-module';
import Workspace from './workspace';

const isNotHiddenDirectory = (dirname: string) => !dirname.startsWith('.');
const isScope = (dirname: string) => dirname.startsWith('@');

export default class ModulesMap extends Map<string, Array<NodeModule>> {
  root: string;
  workspace: Workspace;
  _yarnRequiredByAssigned: boolean;

  constructor({ root, workspace }: { root: string; workspace: Workspace }) {
    super();
    this.root = root;
    this.workspace = workspace;
    this._yarnRequiredByAssigned = false;
  }

  addModule(name: string, nodeModule: NodeModule) {
    if (!this.has(name)) {
      this.set(name, []);
    }

    this.get(name)!.push(nodeModule);
  }

  getModuleOccurrences(name: string) {
    const moduleOccurrences = this.get(name);

    if (!moduleOccurrences) {
      throw new Error(
        `The node module "${name}" does not exist in ${this.root}`
      );
    }

    return moduleOccurrences;
  }

  assignYarnRequiredBy(): void {
    if (this._yarnRequiredByAssigned) {
      return;
    }

    this._yarnRequiredByAssigned = true;
    const yarnLock = this.workspace.yarnLock;

    if (!yarnLock) {
      return;
    }

    // Assign requiredBy using yarn lock
    Object.keys(yarnLock).forEach((moduleAndVerison) => {
      const moduleDependencies = yarnLock[moduleAndVerison].dependencies;

      if (!moduleDependencies) {
        return;
      }

      Object.keys(moduleDependencies).forEach((dependency) => {
        const DependencyModuleOccurrences = this.get(dependency);

        if (!DependencyModuleOccurrences) {
          if (process.env.DEBUG === 'true') {
            console.error(
              chalk.dim(
                `Warning: The module ${dependency} specified in yarn.lock but is not on the file system`
              )
            );
          }
          // Do not fail in this case, maybe the user is intereseted in a different module
          // and this information doesn't interesting to them
          return;
        }

        // We're only interesetd in requiredBy if the module is on the root
        DependencyModuleOccurrences.forEach((nodeModule) => {
          if (!nodeModule.parent) {
            const moduleName = moduleAndVerison.slice(
              0,
              moduleAndVerison.lastIndexOf('@')
            );

            nodeModule.addYarnRequiredByDependency(moduleName);
          }
        });
      });
    });

    // Assign requiredBy using package.json dependencies/devDependencies
    this.forEach((moduleOccurrences, moduleName) => {
      const workspaceDependencies = this.workspace.packageJson.dependencies;
      const workspaceDevDependencies =
        this.workspace.packageJson.devDependencies;

      if (
        workspaceDependencies &&
        Object.keys(workspaceDependencies).includes(moduleName)
      ) {
        moduleOccurrences.forEach((nodeModule) => {
          // We're only interesetd in requiredBy if the module is on the root
          if (!nodeModule.parent) {
            nodeModule.addYarnRequiredByDependency('/');
          }
        });
      }

      if (
        workspaceDevDependencies &&
        Object.keys(workspaceDevDependencies).includes(moduleName)
      ) {
        moduleOccurrences.forEach((nodeModule) => {
          // We're only interesetd in requiredBy if the module is on the root
          if (!nodeModule.parent) {
            nodeModule.addYarnRequiredByDependency('#DEV:/');
          }
        });
      }
    });
  }

  static loadSync(cwd: string, workspace: Workspace): ModulesMap {
    const modulesMap = new ModulesMap({ root: cwd, workspace });
    const visited = new Set();

    const traverseNodeModules = (root: string, parent?: NodeModule) => {
      const nodeModulesPath = path.resolve(root, 'node_modules');

      if (fs.existsSync(nodeModulesPath)) {
        const modulesNames = fs
          .readdirSync(nodeModulesPath)
          .filter(isNotHiddenDirectory);

        flattenDeep(
          modulesNames.map((name) => {
            if (isScope(name)) {
              const subScopeModules = fs.readdirSync(
                path.join(nodeModulesPath, name)
              );

              return subScopeModules.map((subName) => {
                const fullName = `${name}/${subName}`;

                const nodeModule = new NodeModule({
                  nodeModulesPath,
                  name: fullName,
                  parent,
                  workspace,
                });

                modulesMap.addModule(fullName, nodeModule);

                return nodeModule;
              });
            }

            const nodeModule = new NodeModule({
              nodeModulesPath,
              name,
              parent,
              workspace,
            });

            modulesMap.addModule(name, nodeModule);

            return nodeModule;
          })
        ).forEach((nodeModule) => {
          // on yarn 3 with pnpm linker there are cases of circular dependency
          // this makes sure that qnm isn't analyzing the same dependency twice
          if (visited.has(nodeModule.realpath)) return;
          visited.add(nodeModule.realpath);

          traverseNodeModules(nodeModule.path, nodeModule);
        });
      }
    };

    traverseNodeModules(cwd);
    return modulesMap;
  }
}
