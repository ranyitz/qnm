import NodeModule from '../workspace/node-module';
import { CliOptions } from '../cli';
import renderModuleOccurrences from './render-module-occurrences';
import renderModuleList from './render-module-list';

export const renderMonorepo = (
  rootPackageModules: Array<NodeModule>,
  packagesModules: Array<[string, Array<NodeModule>]>,
  options: CliOptions
) => {
  return [
    renderModuleOccurrences(rootPackageModules, options),
    ...packagesModules.map(([packageName, packageModuleOccurrences]) => {
      return renderModuleOccurrences(
        packageModuleOccurrences,
        options,
        packageName
      );
    }),
  ].join('\n');
};

export const renderMonorepoList = (
  rootPackageModulesList: Array<[string, Array<NodeModule>]>,
  packagesModulesList: Array<[string, Array<[string, Array<NodeModule>]>]>,
  options: CliOptions
) => {
  return [
    renderModuleList(rootPackageModulesList, options),
    ...packagesModulesList.map(([packageName, packagesModules]) =>
      renderModuleList(packagesModules, options, packageName)
    ),
  ].join('\n');
};
