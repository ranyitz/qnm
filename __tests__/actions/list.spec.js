const listAction = require('../../src/actions/list');
const { resolveWorkspace } = require('../utils');

describe('list', () => {
  it('should list the versions of mixed modules', () => {
    const workspace = resolveWorkspace('mix-modules');
    const output = listAction(workspace);

    expect(output).toMatchSnapshot();
  });
});
