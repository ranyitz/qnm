import NodeModule from '../workspace/node-module';
import { CliOptions } from '../cli';
import renderModuleOccurrences from './render-module-occurrences';

export default (
  rootPackageModules: Array<NodeModule>,
  packagesModules: Array<[string, Array<NodeModule>]>,
  options: CliOptions,
) => {
  return [
    renderModuleOccurrences(rootPackageModules, options),
    ...packagesModules.map(([packageName, packageModuleOccurrences]) => {
      return renderModuleOccurrences(
        packageModuleOccurrences,
        options,
        packageName,
      );
    }),
  ].join('\n');
};
