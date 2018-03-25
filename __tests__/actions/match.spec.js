const chalk = require('chalk');
const matchAction = require('../../src/actions/match');
const { resolveWorkspace } = require('../utils');

describe('match', () => {
  it('should print the matched modules according to passed string', () => {
    const workspace = resolveWorkspace('mix-modules');
    const output = matchAction(workspace, 'anot');

    expect(output).toMatch(`${chalk.underline(`${chalk.magenta('anot')}her`)}
└── 1.0.0`);
  });

  it('should show a message when no module has matched the provided string', () => {
    const workspace = resolveWorkspace('single-module');
    try {
      matchAction(workspace, 'bla');
    } catch (e) {
      expect(e.message).toMatch('Could not find any module that matches "bla"');
    }
  });
});
