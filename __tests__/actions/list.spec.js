const chalk = require('chalk');
const listAction = require('../../src/actions/list');
const { resolveWorkspace } = require('../utils');

describe('list', () => {
  it('should list the versions of mixed modules', () => {
    const workspace = resolveWorkspace('mix-modules');
    const output = listAction(workspace);

    expect(output).toMatch(`@scope/test
└── 1.0.0

another
└── 1.0.0

test
├── 1.0.0
└─┬ ${chalk.grey('another')}
  └── 1.0.0`);
  });
});
