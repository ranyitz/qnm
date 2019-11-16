import path from 'path';
import Workespace from '../workspace/workspace';

export const resolveFixture = (fixure: string) =>
  path.resolve(__dirname, './fixtures', fixure);

export const resolveWorkspace = (fixure: string) =>
  Workespace.loadSync(exports.resolveFixture(fixure));
