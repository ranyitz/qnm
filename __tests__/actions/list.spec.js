const listAction = require('../../src/actions/list');
const { resolveWorkspace } = require('../utils');

describe('list', () => {
  it('should list the versions of mixed modules', () => {
    const workspace = resolveWorkspace('mix-modules');
    const output = listAction(workspace);

    expect(output).toMatchSnapshot();
  });

  it('should disable colors', () => {
    const workspace = resolveWorkspace('mix-modules');
    const output = listAction(workspace, {
      noColor: true,
    });

    expect(output).toMatchSnapshot();
  });

  it('should show why info', () => {
    const workspace = resolveWorkspace('single-module');
    const output = listAction(workspace, {
      why: true,
    });

    expect(output).toMatchSnapshot();
  });
});
