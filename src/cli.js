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
    .command('list')
    .description('list all node_modules with their versions')
    .option('--json-output', 'output results as json')
    .action(({ jsonOutput: json }) => {
      const workspace = Workspace.loadSync();
      console.log(listAction(workspace, { json }));
    });

  program
    .arguments('[module]', 'prints module version from the node_modules')
    .option('-m, --match', 'prints modules which matches the provided string')
    .option(
      '-w, --why',
      'add information regarding why this package was installed',
    )
    .option('--json', 'output results as json')
    .option('-d, --debug', 'see full error messages, mostly for debugging');

  program.parse(process.argv);

  const preDefinedCommands = program.commands.map(c => c._name);
  setupCompletions(preDefinedCommands);

  const workspace = Workspace.loadSync();

  if (program.args.length === 0) {
    fuzzySearchAction(workspace);
  } else {
    const firstArg = program.rawArgs[2];

    if (!preDefinedCommands.includes(firstArg) && firstArg !== 'completion') {
      const arg = program.args[0];
      const { match, why, json } = program;

      if (match) {
        console.log(matchAction(workspace, arg, { json }));
      } else {
        console.log(getAction(workspace, arg, { why, json }));
      }
    }
  }
} catch (error) {
  handleError(error, program.debug);
}
