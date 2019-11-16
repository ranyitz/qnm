import fs from 'fs';
import path from 'path';
import NodeModule from './node-module';
import flattenDeep from 'lodash/flattenDeep';

const isNotHiddenDirectory = (dirname: string) => !dirname.startsWith('.');
const isScope = (dirname: string) => dirname.startsWith('@');

export default class ModulesMap extends Map<string, Array<NodeModule>> {
  root: string;

  constructor({ root }: { root: string }) {
    super();
    this.root = root;
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
        `The node module "${name}" does not exist in ${this.root}`,
      );
    }

    return moduleOccurrences;
  }

  static loadSync(cwd: string): ModulesMap {
    const modulesMap = new ModulesMap({ root: cwd });

    function traverseNodeModules(root: string, parent?: NodeModule) {
      const nodeModulesPath = path.resolve(root, 'node_modules');

      if (fs.existsSync(nodeModulesPath)) {
        const modulesNames = fs
          .readdirSync(nodeModulesPath)
          .filter(isNotHiddenDirectory);

        flattenDeep(
          modulesNames.map(name => {
            if (isScope(name)) {
              const subScopeModules = fs.readdirSync(
                path.join(nodeModulesPath, name),
              );

              return subScopeModules.map(subName => {
                const fullName = path.join(name, subName);
                const nodeModule = new NodeModule({
                  nodeModulesPath,
                  name: fullName,
                  parent,
                });

                modulesMap.addModule(fullName, nodeModule);

                return nodeModule;
              });
            }

            const nodeModule = new NodeModule({
              nodeModulesPath,
              name,
              parent,
            });

            modulesMap.addModule(name, nodeModule);

            return nodeModule;
          }),
        ).forEach(nodeModule =>
          traverseNodeModules(nodeModule.path, nodeModule),
        );
      }
    }

    traverseNodeModules(cwd);
    return modulesMap;
  }
}
