import Workspace from './workspace/workspace';
import { CliOptions } from './cli';

import matchAction from './actions/match';
import getAction from './actions/get';
import listAction from './actions/list';
import fuzzySearchAction from './actions/fuzzy-search';

type Options = Pick<CliOptions, 'deps' | 'match'>;

export function match(match: string, cwd?: string, options?: Options) {
  const workspace = Workspace.loadSync(cwd);

  return matchAction(workspace, match, options);
}

export function get(name: string, cwd?: string, options?: Options) {
  const workspace = Workspace.loadSync(cwd);

  return getAction(workspace, name, options);
}

export function list(cwd?: string, options?: Options) {
  const workspace = Workspace.loadSync(cwd);

  return listAction(workspace, options);
}

export function search(cwd?: string, options: Options = {}) {
  const workspace = Workspace.loadSync(cwd);

  return fuzzySearchAction(workspace, options);
}
