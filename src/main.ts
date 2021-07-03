import Workspace from './workspace/workspace';
import { CliOptions } from './cli';
import merge from 'lodash/merge'

import matchAction from './actions/match';
import getAction from './actions/get';
import listAction from './actions/list';
import fuzzySearchAction from './actions/fuzzy-search';

type Options = Pick<CliOptions, 'deps' | 'match'>;

const defaultOptions = {
  noColor: true,
}

export function match(matchPattern: string, cwd?: string, options?: Options) {
  const workspace = Workspace.loadSync(cwd);

  return matchAction(workspace, matchPattern, merge(defaultOptions, options));
}

export function get(name: string, cwd?: string, options?: Options) {
  const workspace = Workspace.loadSync(cwd);

  return getAction(workspace, name, merge(defaultOptions, options));
}

export function list(cwd?: string, options?: Options) {
  const workspace = Workspace.loadSync(cwd);

  return listAction(workspace, merge(defaultOptions, options));
}

export function search(cwd?: string, options: Options = {}) {
  const workspace = Workspace.loadSync(cwd);

  return fuzzySearchAction(workspace, merge(defaultOptions, options));
}
