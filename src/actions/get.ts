import opn from 'open';
import getSuggestions from '../suggest/get-suggestions';
import NotFoundModuleError from '../errors/not-found-module-error';
import NotFoundHomepageError from '../errors/not-found-homepage-error';
import renderModuleOccurrences from '../render/render-module-occurrences';
import Workspace from '../workspace/workspace';
import { CliOptions } from '../cli';
import openPackage from './helpers/open';
import isEmpty from 'lodash/isEmpty';

export default (
  workspace: Workspace,
  name: string,
  options: CliOptions = {},
) => {
  const moduleOccurrences = workspace.getModuleOccurrences(name);
  const { open, homepage } = options;

  if (isEmpty(moduleOccurrences)) {
    const modulesNames = workspace.getModulesNames();
    const suggestions = getSuggestions(name, modulesNames);

    throw new NotFoundModuleError(name, suggestions);
  }

  if (open) {
    return openPackage(moduleOccurrences, workspace.root);
  }

  if (homepage) {
    // take only the first option
    const [nodeModule] = workspace.getModuleOccurrences(name);
    const homepageUrl = nodeModule.packageJson.homepage;

    if (!homepageUrl) throw new NotFoundHomepageError(name);
    return opn(homepageUrl, { wait: false });
  }

  return renderModuleOccurrences(moduleOccurrences, options);
};
