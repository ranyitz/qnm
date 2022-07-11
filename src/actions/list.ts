import NoModulesError from '../errors/no-modules-error';
import renderModuleList from '../render/render-module-list';
import Workspace from '../workspace/workspace';
import { CliOptions } from '../cli';

export default (workspace: Workspace, options: CliOptions = {}) => {
  if (options.deps) {
    const moduleOccurrencesList = workspace.listPackageJsonDependencies();

    return renderModuleList(moduleOccurrencesList, options, workspace);
  }

  const moduleOccurrencesList = workspace.list();

  if (moduleOccurrencesList.length === 0) {
    throw new NoModulesError();
  }

  return renderModuleList(moduleOccurrencesList, options, workspace);
};
