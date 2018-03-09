const chalk = require('chalk');
const matchAction = require('../../src/actions/match');
const { resolveWorkspace } = require('../utils');

describe('list', () => {
  it('should print the matched modules according to passed string', () => {
    const workspace = resolveWorkspace('mix-modules');
    const output = matchAction(workspace, 'anot');

    expect(output).not.toMatch(`@scope/test > ${chalk.bold('1.0.0')}`);
    expect(output).toMatch(`${chalk.magenta('anot')}her > ${chalk.bold('1.0.0')}`);
    expect(output).not.toMatch(`test > ${chalk.bold('1.0.0')}`);
    expect(output).not.toMatch(`> ${chalk.bold('1.0.0')} ${chalk.magenta('(another)')}`);
  });

  it('should show a message when no module has matched the provided string', () => {
    const workspace = resolveWorkspace('single-module');
    const output = matchAction(workspace, 'bla');

    expect(output).toMatch('Could not find any module that matches "bla"');
  });
});
