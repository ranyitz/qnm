import NotMatchModuleError from '../errors/not-match-module-error';
import renderModuleList from '../render/render-module-list';
import Workspace from '../workspace/workspace';
import { CliOptions } from '../cli';

export default (
  workspace: Workspace,
  match: string,
  options: CliOptions = {}
) => {
  const moduleOccurrencesList = workspace.match(match);

  if (moduleOccurrencesList.length === 0) {
    throw new NotMatchModuleError(match);
  }

  return renderModuleList(
    moduleOccurrencesList,
    { ...options, match },
    workspace
  );
};
