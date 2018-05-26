const getAction = require('../../src/actions/get');
const { resolveWorkspace } = require('../utils');

jest.mock('opn');
const opn = require('opn');

jest.mock('prompts', () => {
  return jest.fn(() => ({ then: () => {} }));
});
const prompts = require('prompts');

describe('get', () => {
  it('should get the version of a single module', () => {
    const workspace = resolveWorkspace('single-module');
    const output = getAction(workspace, 'test');

    expect(output).toMatchSnapshot();
  });

  it('should show a message when no module has found', () => {
    const workspace = resolveWorkspace('single-module');
    try {
      getAction(workspace, 'not-exist');
    } catch (e) {
      expect(e.message).toMatchSnapshot();
    }
  });

  it('should suggest an alternative when no module has found and there is an alternative with an edit distance smaller than 2', () => {
    const workspace = resolveWorkspace('single-module');
    try {
      getAction(workspace, 'dest');
    } catch (e) {
      expect(e.message).toMatchSnapshot();
      expect(e.message).toMatchSnapshot();
    }
  });

  it('should get the version of a module in depth', () => {
    const workspace = resolveWorkspace('module-in-depth');
    const output = getAction(workspace, 'test');

    expect(output).toMatchSnapshot();
  });

  it('should disable colors', () => {
    const workspace = resolveWorkspace('module-in-depth');
    const output = getAction(workspace, 'test', {
      noColor: true,
    });

    expect(output).toMatchSnapshot();
  });

  it('should get the version of a single module when not starting at the root', () => {
    const workspace = resolveWorkspace('single-module/node_modules');
    const output = getAction(workspace, 'test');

    expect(output).toMatchSnapshot();
  });

  it('should get the version of a single module when in a scoped package', () => {
    const workspace = resolveWorkspace('scoped-module');
    const output = getAction(workspace, '@scope/test');

    expect(output).toMatchSnapshot();
  });

  it('should print versions in three levels deep including ancestors', () => {
    const workspace = resolveWorkspace('three-levels-deep');
    const output = getAction(workspace, 'dep-of-dep-of-dep');

    expect(output).toMatchSnapshot();
  });

  it('should open module file directory when --open flag used', () => {
    const workspace = resolveWorkspace('three-levels-deep');
    getAction(workspace, 'dep', { open: true });

    expect(opn).toHaveBeenCalledWith(
      expect.stringMatching(/node_modules\/dep$/),
      expect.any(Object),
    );
  });

  it('should open correct module file directory when --open flag used with few packages matched', () => {
    const workspace = resolveWorkspace('few-modules');
    getAction(workspace, 'dependency2', { open: true });

    expect(prompts).toHaveBeenCalledWith(
      expect.objectContaining({
        choices: expect.any(Array),
      }),
    );
  });
});
