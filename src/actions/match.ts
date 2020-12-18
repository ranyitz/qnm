import isEmpty from 'lodash/isEmpty';
import NotMatchModuleError from '../errors/not-match-module-error';
import renderModuleList from '../render/render-module-list';
import { renderMonorepoList } from '../render/render-monorepo';
import Workspace from '../workspace/workspace';
import { CliOptions } from '../cli';

export default (
  workspace: Workspace,
  match: string,
  options: CliOptions = {},
) => {
  const moduleOccurrencesList = workspace.match(match);

  if (isEmpty(moduleOccurrencesList)) {
    throw new NotMatchModuleError(match);
  }

  if (workspace.isMonorepo) {
    const packagesModuleOccurrencesList = workspace.matchPackagesModuleOccurrences(
      match,
    );

    return renderMonorepoList(
      moduleOccurrencesList,
      packagesModuleOccurrencesList,
      { ...options, match },
    );
  }

  return renderModuleList(moduleOccurrencesList, { ...options, match });
};
