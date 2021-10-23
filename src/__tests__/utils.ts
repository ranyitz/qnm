import path from 'path';
import Workspace from '../workspace/workspace';

export const resolveFixture = (fixure: string) =>
  path.resolve(__dirname, './fixtures', fixure);

export const resolveWorkspace = (fixure: string) =>
  Workspace.loadSync({ cwd: exports.resolveFixture(fixure) });
