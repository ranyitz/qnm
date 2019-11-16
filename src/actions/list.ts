import NoModulesError from '../errors/no-modules-error';
import renderModuleList from '../render/render-module-list';
import Workspace from '../workspace/workspace';
import { CliOptions } from '../cli';
import isEmpty from 'lodash/isEmpty';

export default (workspace: Workspace, options: CliOptions = {}) => {
  if (options.deps) {
    const moduleOccurrencesList = workspace.listPackageJsonDependencies();

    return renderModuleList(moduleOccurrencesList, options);
  }

  const moduleOccurrencesList = workspace.list();

  if (isEmpty(moduleOccurrencesList)) {
    throw new NoModulesError();
  }

  return renderModuleList(moduleOccurrencesList, options);
};
