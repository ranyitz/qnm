import { CliOptions } from '../cli';
import NodeModule from '../workspace/node-module';
import renderModuleOccurrences from './render-module-occurrences';

export default (
  moduleOccurrencesList: Array<[string, Array<NodeModule>]>,
  options: CliOptions,
): string => {
  return moduleOccurrencesList
    .map(([, moduleOccurrences]) =>
      renderModuleOccurrences(moduleOccurrences, options)
    )
    .join('\n');
};
