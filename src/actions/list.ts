import isEmpty from 'lodash/isEmpty';
import NoModulesError from '../errors/no-modules-error';
import renderModuleList from '../render/render-module-list';
import Workspace from '../workspace/workspace';
import { CliOptions } from '../cli';
import { renderMonorepoList } from '../render/render-monorepo';

export default (workspace: Workspace, options: CliOptions = {}) => {
  if (options.deps) {
    const moduleOccurrencesList = workspace.listPackageJsonDependencies();

    return renderModuleList(moduleOccurrencesList, options);
  }

  const moduleOccurrencesList = workspace.list();

  if (isEmpty(moduleOccurrencesList)) {
    throw new NoModulesError();
  }

  if (workspace.isMonorepo) {
    const packagesModuleOccurrencesList =
      workspace.listPackagesModuleOccurrences();

    return renderMonorepoList(
      moduleOccurrencesList,
      packagesModuleOccurrencesList,
      options,
    );
  }

  return renderModuleList(moduleOccurrencesList, options);
};
