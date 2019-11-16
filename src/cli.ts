/* eslint-disable no-console */
import { spawn } from 'child_process';
import program from 'commander';
import updateNotifier from 'update-notifier';
import { clear } from './actions/helpers/console';
import pkg from '../package.json';
import Workspace from './workspace/workspace';
import setupCompletions from './completions/setup-completions';
import matchAction from './actions/match';
import getAction from './actions/get';
import listAction from './actions/list';
import fuzzySearchAction from './actions/fuzzy-search';
import handleError from './handler-error';

updateNotifier({ pkg }).notify();

try {
  program
    .version(pkg.version)
    .arguments('[module]', 'prints module version from the node_modules')
    .option(
      '-w, --why',
      'add information regarding why this package was installed',
    )
    .option('-d, --debug', 'see full error messages, mostly for debugging')
    .option('-o, --open', 'open editor at the package.json of a chosen module')
    .option('--disable-colors', 'minimize color and styling usage in output')
    .option('--homepage', "open module's homepage using the default browser");

  program
    .command('install-completions')
    .description('attempt to install tab completions using tabtab')
    .action(() => {
      const tabtabCliPath = require.resolve('tabtab/src/cli');
      clear();

      return spawn('node', [tabtabCliPath, 'install'], { stdio: 'inherit' });
    });

  program
    .command('list')
    .description('list all node_modules with their versions')
    .option(
      '--deps',
      'list dependencies and devDependencies based on package.json.',
    )
    .option(
      '-w, --why',
      'add information regarding why packages were installed',
    )
    .action(cmd => {
      const { disableColors, why } = program;
      const workspace = Workspace.loadSync();

      console.log(
        listAction(workspace, {
          deps: cmd.deps,
          noColor: disableColors,
          why,
        }),
      );
    });

  program
    .command('match <string>')
    .description('prints modules which matches the provided string')
    .option(
      '-w, --why',
      'add information regarding why packages were installed',
    )
    .action(string => {
      const { disableColors, why } = program;
      const workspace = Workspace.loadSync();

      console.log(
        matchAction(workspace, string, { noColor: disableColors, why }),
      );
    });

  program.parse(process.argv);

  const preDefinedCommands = program.commands.map(c => c._name);

  setupCompletions(preDefinedCommands);

  const workspace = Workspace.loadSync();

  const { why, deps, disableColors, open, homepage } = program;
  const options = { why, deps, noColor: disableColors, open, homepage };

  if (program.rawArgs.length < 3) {
    fuzzySearchAction(workspace, options);
  } else {
    const firstArg = program.rawArgs[2];

    if (!preDefinedCommands.includes(firstArg) && firstArg !== 'completion') {
      const [arg] = program.args;
      const output = getAction(workspace, arg, options);

      if (!options.open && !options.homepage) {
        console.log(output);
      }
    }
  }
} catch (error) {
  handleError(error, program.debug);
}
