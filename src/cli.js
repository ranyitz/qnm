/* eslint-disable no-console */
const program = require('commander');
const pkg = require('../package.json');
const Workspace = require('./workspace/workspace');
const setupCompletions = require('./completions/setup-completions');

const matchAction = require('./actions/match');
const getAction = require('./actions/get');
const listAction = require('./actions/list');

const handleError = require('./handler-error');

try {
  program
    .version(pkg.version)
    .command('list')
    .description('list all node_modules with their versions')
    .action(() => {
      const workspace = Workspace.loadSync();
      console.log(listAction(workspace));
    });

  program
    .arguments('[module]', 'prints module version from the node_modules')
    .option(
      '-m, --match',
      'works like grep, and prints modules which the provided string matches',
    )
    .option('-w, --why', 'add information regarding why this package installed')
    .option('-d, --debug', 'see full error messages, mostly for debugging');

  program.parse(process.argv);

  // if no arguments specified, show help
  if (program.args.length === 0) {
    program.help();
  }

  const preDefinedCommands = program.commands.map(c => c._name);
  setupCompletions(preDefinedCommands);

  const firstArg = program.rawArgs[2];

  if (!preDefinedCommands.includes(firstArg) && firstArg !== 'completion') {
    const arg = program.args[0];
    const { match, why } = program;

    const workspace = Workspace.loadSync();

    if (match) {
      console.log(matchAction(workspace, arg));
    } else {
      console.log(getAction(workspace, arg, { why }));
    }
  }
} catch (error) {
  handleError(error, program.debug);
}
