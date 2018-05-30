const Workspace = require('../src/workspace/workspace');
const { resolveFixture } = require('./utils');

describe('workspace', () => {
  it('should throw an error for no package case', () => {
    try {
      Workspace.loadSync('/no/package/case/@@/__');
    } catch (error) {
      expect(error).toMatchSnapshot();
    }
  });

  it('should throw an error for no node_modules case', () => {
    try {
      Workspace.loadSync(resolveFixture('workspace/no-node_modules'));
    } catch (error) {
      expect(error).toMatchSnapshot();
    }
  });

  it('should throw an error for empty node_modules case', () => {
    try {
      Workspace.loadSync(resolveFixture('workspace/empty-node_modules'));
    } catch (error) {
      expect(error).toMatchSnapshot();
    }
  });
});
