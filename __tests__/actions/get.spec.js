const chalk = require('chalk');
const getAction = require('../../src/actions/get');
const { resolveWorkspace } = require('../utils');

describe('get', () => {
  it('should get the version of a single module', () => {
    const workspace = resolveWorkspace('single-module');
    const output = getAction(workspace, 'test');

    expect(output).toMatch(`> ${chalk.bold('1.0.0')}`);
  });

  it('should show a message when no module has found', () => {
    const workspace = resolveWorkspace('single-module');
    const output = getAction(workspace, 'not-exist');

    expect(output).toMatch('Could not find any module by the name "not-exist"');
  });

  it('should suggest an alternative when no module has found and there is an alternative with an edit distance smaller than 2', () => {
    const workspace = resolveWorkspace('single-module');
    const output = getAction(workspace, 'dest');

    expect(output).toMatch('Could not find any module by the name "dest"');
    expect(output).toMatch(`Did you mean "${chalk.bold('t')}est?"`);
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
