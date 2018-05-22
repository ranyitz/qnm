/* eslint-disable no-console */
const program = require('commander');
const pkg = require('../package.json');
const Workspace = require('./workspace/workspace');
const setupCompletions = require('./completions/setup-completions');

const matchAction = require('./actions/match');
const getAction = require('./actions/get');
const listAction = require('./actions/list');
const fuzzySearchAction = require('./actions/fuzzy-search');

const handleError = require('./handler-error');

try {
  program
    .version(pkg.version)
    .arguments('[module]', 'prints module version from the node_modules')
    .option(
      '-w, --why',
      'add information regarding why this package was installed',
    )
    .option('--disable-colors', 'minimize color and styling usage in output')
    .option('-d, --debug', 'see full error messages, mostly for debugging');

  program
    .command('list')
    .description('list all node_modules with their versions')
    .option(
      '--deps',
      'list dependencies and devDependencies based on package.json.',
    )
    .action(cmd => {
      const { disableColors } = program;
      const workspace = Workspace.loadSync();

      console.log(
        listAction(workspace, {
          deps: cmd.deps,
          noColor: disableColors,
        }),
      );
    });

  program
    .command('match <string>')
    .description('prints modules which matches the provided string')
    .action(string => {
      const { disableColors } = program;
      const workspace = Workspace.loadSync();

      console.log(matchAction(workspace, string, { noColor: disableColors }));
    });

  program.parse(process.argv);

  const preDefinedCommands = program.commands.map(c => c._name);

  setupCompletions(preDefinedCommands);

  const workspace = Workspace.loadSync();

  const { why, deps, disableColors } = program;
  const options = { why, deps, noColor: disableColors };

  if (program.args.length === 0) {
    fuzzySearchAction(workspace, options);
  } else {
    const firstArg = program.rawArgs[2];

    if (!preDefinedCommands.includes(firstArg) && firstArg !== 'completion') {
      const [arg] = program.args;

      console.log(getAction(workspace, arg, options));
    }
  }
} catch (error) {
  handleError(error, program.debug);
}
