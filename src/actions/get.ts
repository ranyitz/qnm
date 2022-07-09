import opn from 'open';
import isEmpty from 'lodash/isEmpty';
import getSuggestions from '../suggest/get-suggestions';
import NotFoundModuleError from '../errors/not-found-module-error';
import NotFoundHomepageError from '../errors/not-found-homepage-error';
import NotFoundRepositoryError from '../errors/not-found-repository-error';
import renderModuleOccurrences from '../render/render-module-occurrences';
import Workspace from '../workspace/workspace';
import { CliOptions } from '../cli';
import openPackage from './helpers/open';

export default (
  workspace: Workspace,
  name: string,
  options: CliOptions = {}
): string | undefined => {
  let moduleOccurrences;
  let monorepoCwdModuleName;

  if (workspace.isPackageInMonorepo) {
    moduleOccurrences = workspace.parentMonorepo.getModuleOccurrences(name);
    monorepoCwdModuleName = workspace.name;
  } else {
    moduleOccurrences = workspace.getModuleOccurrences(name);
  }

  const { open, homepage, repo } = options;

  if (isEmpty(moduleOccurrences)) {
    let suggestions: Array<string> = [];

    try {
      const modulesNames = workspace.getModulesNames();
      suggestions = getSuggestions(name, modulesNames);
    } catch (error) {
      // A case when we don't have node_modules at all
      // so the call to .getModuleNames fails
    }

    throw new NotFoundModuleError(name, suggestions);
  }

  if (open) {
    openPackage(moduleOccurrences, workspace.root);
  }

  if (homepage || repo) {
    const [nodeModule] = moduleOccurrences;
    const packageJson = nodeModule.packageJson;

    if (homepage) {
      if (!packageJson?.homepage) {
        throw new NotFoundHomepageError(name);
      }

      opn(packageJson.homepage, { wait: false });
    }

    if (repo) {
      const repositoryUrl =
        typeof packageJson?.repository === 'object'
          ? packageJson?.repository?.url
          : packageJson?.repository;

      if (!repositoryUrl?.startsWith('http')) {
        // Here we should probably use a better url validation
        throw new NotFoundRepositoryError(name);
      }

      opn(repositoryUrl, { wait: false });
    }
  }

  return renderModuleOccurrences(
    moduleOccurrences,
    options,
    workspace,
    monorepoCwdModuleName
  );
};
