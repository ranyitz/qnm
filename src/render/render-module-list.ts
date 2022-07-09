import { CliOptions } from '../cli';
import NodeModule from '../workspace/node-module';
import Workspace from '../workspace/workspace';
import renderModuleOccurrences from './render-module-occurrences';

export default (
  moduleOccurrencesList: Array<[string, Array<NodeModule>]>,
  options: CliOptions,
  workspace: Workspace
): string => {
  return moduleOccurrencesList
    .map(([, moduleOccurrences]) =>
      renderModuleOccurrences(moduleOccurrences, options, workspace)
    )
    .join('\n');
};
