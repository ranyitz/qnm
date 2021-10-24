import opn from 'open';
import isEmpty from 'lodash/isEmpty';
import getSuggestions from '../suggest/get-suggestions';
import NotFoundModuleError from '../errors/not-found-module-error';
import NotFoundHomepageError from '../errors/not-found-homepage-error';
import NotFoundRepositoryError from '../errors/not-found-repository-error';
import renderModuleOccurrences from '../render/render-module-occurrences';
import { renderMonorepo } from '../render/render-monorepo';
import Workspace from '../workspace/workspace';
import { CliOptions } from '../cli';
import openPackage from './helpers/open';

export default (
  workspace: Workspace,
  name: string,
  options: CliOptions = {},
): string | undefined => {
  const moduleOccurrences = workspace.getModuleOccurrences(name);
  const { open, homepage, repo } = options;

  if (isEmpty(moduleOccurrences)) {
    const modulesNames = workspace.getModulesNames();
    const suggestions = getSuggestions(name, modulesNames);

    throw new NotFoundModuleError(name, suggestions);
  }

  if (open) {
    openPackage(moduleOccurrences, workspace.root);
  }

  if (homepage || repo) {
    const [nodeModule] = workspace.getModuleOccurrences(name);
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

  if (workspace.isMonorepo) {
    const packagesModuleOccurrences = workspace.getPackagesModuleOccurrences(
      name,
    );

    return renderMonorepo(
      moduleOccurrences,
      packagesModuleOccurrences,
      options,
    );
  }

  return renderModuleOccurrences(moduleOccurrences, options);
};
