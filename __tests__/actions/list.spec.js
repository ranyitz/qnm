const chalk = require('chalk');
const listAction = require('../../src/actions/list');
const { resolveWorkspace } = require('./utils');

describe('list', () => {
  it('should list the versions of mixed modules', () => {
    const workspace = resolveWorkspace('mix-modules');
    const output = listAction(workspace);

    expect(output).toMatch(`@scope/test > ${chalk.bold('1.0.0')}`);
    expect(output).toMatch(`another > ${chalk.bold('1.0.0')}`);
    expect(output).toMatch(`test > ${chalk.bold('1.0.0')}`);
    expect(output).toMatch(`> ${chalk.bold('1.0.0')} ${chalk.magenta('(another)')}`);
  });
});
