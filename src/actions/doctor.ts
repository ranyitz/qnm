import isEmpty from 'lodash/isEmpty';
import NoModulesError from '../errors/no-modules-error';
import renderModuleList from '../render/render-module-list';
import Workspace from '../workspace/workspace';
import { CliOptions } from '../cli';
// import { renderMonorepoList } from '../render/render-monorepo';

export default async (workspace: Workspace, options: CliOptions = {}) => {
  const moduleOccurrencesList = await workspace.listHeavyModules(options.sort!);

  console.log(moduleOccurrencesList);
  if (isEmpty(moduleOccurrencesList)) {
    throw new NoModulesError();
  }

  if (workspace.isMonorepo) {
    // const packagesModuleOccurrencesList =
    //   workspace.listPackagesModuleOccurrences();
    // return renderMonorepoList(
    //   moduleOccurrencesList,
    //   packagesModuleOccurrencesList,
    //   options,
    // );
  }

  // console.log(moduleOccurrencesList);
  // return renderModuleList(moduleOccurrencesList, options);
};
