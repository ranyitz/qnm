const chalk = require('chalk');
const getAction = require('../../src/actions/get');
const { resolveWorkspace } = require('./utils');

describe('get', () => {
  it('should get the version of a single module', () => {
    const workspace = resolveWorkspace('single-module');
    const output = getAction(workspace, 'test');

    expect(output).toMatch(`> ${chalk.bold('1.0.0')}`);
  });

  it('should show a message when no module has found', () => {
    // TODO
  });

  it('should get the version of a module in depth', () => {
    const workspace = resolveWorkspace('module-in-depth');
    const output = getAction(workspace, 'test');

    expect(output).toMatch(`> ${chalk.bold('1.0.0')} ${chalk.magenta('(another)')}`);
  });

  it('should get the version of a single module when not starting at the root', () => {
    const workspace = resolveWorkspace('single-module/node_modules');
    const output = getAction(workspace, 'test');

    expect(output).toMatch(`> ${chalk.bold('1.0.0')}`);
  });

  it('should get the version of a single module when in a scoped package', () => {
    const workspace = resolveWorkspace('scoped-module');
    const output = getAction(workspace, '@scope/test');

    expect(output).toMatch(`> ${chalk.bold('1.0.0')}`);
  });
});
