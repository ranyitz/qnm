const chalk = require('chalk');
const listAction = require('../../src/actions/list');
const { resolveWorkspace } = require('../utils');

describe('list', () => {
  it('should list the versions of mixed modules', () => {
    const workspace = resolveWorkspace('mix-modules');
    const output = listAction(workspace);

    expect(output).toMatch(`${chalk.underline('@scope/test')}
└── 1.0.0

${chalk.underline('another')}
└── 1.0.0

${chalk.underline('test')}
├── 1.0.0
└─┬ ${chalk.grey('another')}
  └── 1.0.0`);
  });
});
