import { CliOptions } from '../cli';
import NodeModule from '../workspace/node-module';
import renderModuleOccurrences from './render-module-occurrences';

export default (
  moduleOccurrencesList: Array<[string, Array<NodeModule>]>,
  options: CliOptions,
  monorepoPackageName?: string,
): string => {
  return moduleOccurrencesList
    .map(([, moduleOccurrences]) =>
      renderModuleOccurrences(moduleOccurrences, options, monorepoPackageName),
    )
    .join('\n');
};
