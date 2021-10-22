import Workspace from '../workspace/workspace';
import { resolveFixture } from './utils';

describe('workspace', () => {
  it('should throw an error for no package case', () => {
    try {
      Workspace.loadSync({ cwd: '/no/package/case/@@/__' });
    } catch (error) {
      expect(error).toMatchSnapshot();
    }
  });

  it('should throw an error for no node_modules case', () => {
    try {
      Workspace.loadSync({ cwd: resolveFixture('workspace/no-node_modules') });
    } catch (error) {
      expect(error).toMatchSnapshot();
    }
  });

  it('should throw an error for empty node_modules case', () => {
    try {
      Workspace.loadSync({
        cwd: resolveFixture('workspace/empty-node_modules'),
      });
    } catch (error) {
      expect(error).toMatchSnapshot();
    }
  });
});
