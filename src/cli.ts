/* eslint-disable no-console */
import { spawn } from 'child_process';
import program from 'commander';
import updateNotifier from 'update-notifier';
import { clearTerminal } from './actions/helpers/terminal';
import Workspace from './workspace/workspace';
import setupCompletions from './completions/setup-completions';
import matchAction from './actions/match';
import getAction from './actions/get';
import listAction from './actions/list';
import fuzzySearchAction from './actions/fuzzy-search';
import handleError from './handler-error';

const pkg = require('../package.json');

updateNotifier({ pkg }).notify();

export type CliOptions = {
  deps?: boolean;
  noColor?: boolean;
  open?: boolean;
  homepage?: boolean;
  repo?: boolean;
  match?: string;
};

try {
  // global program options goes here
  program
    .version(pkg.version, '-v, --version', 'output the current version')
    .option('-d, --debug', 'see full error messages, mostly for debugging')
    .option('-o, --open', 'open editor at the package.json of a chosen module')
    .option('--disable-colors', 'minimize color and styling usage in output')
    .option('--homepage', "open module's homepage using the default browser")
    .option('--repo', 'open repository in browser if present');

  program
    .command('default', { isDefault: true })
    .allowUnknownOption()
    .arguments('[module]')
    .description('prints module version from the node_modules', {
      module: 'name of the npm package to search for',
    });

  program
    .command('install-completions')
    .description('attempt to install tab completions using tabtab')
    .action(() => {
      const tabtabCliPath = require.resolve('tabtab/src/cli');

      clearTerminal();

      spawn('node', [tabtabCliPath, 'install'], { stdio: 'inherit' });
    });

  program
    .command('list')
    .description('list all node_modules with their versions')
    .option(
      '--deps',
      'list dependencies and devDependencies based on package.json.',
    )
    .action((cmd) => {
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
    .action((string) => {
      const { disableColors } = program;
      const workspace = Workspace.loadSync();

      console.log(matchAction(workspace, string, { noColor: disableColors }));
    });

  program.parse(process.argv);

  const preDefinedCommands = program.commands.map((c) => c._name as string);

  setupCompletions(preDefinedCommands);

  const workspace = Workspace.loadSync();

  const { deps, disableColors, open, homepage, repo } = program;

  const options: CliOptions = {
    deps,
    noColor: disableColors,
    open,
    homepage,
    repo,
  };

  if (
    program.rawArgs.filter((arg: string) => !arg.startsWith('-')).length < 3
  ) {
    fuzzySearchAction(workspace, options);
  } else {
    const firstArg = program.rawArgs[2];

    if (!preDefinedCommands.includes(firstArg) && firstArg !== 'completion') {
      const [arg] = program.args;
      const output = getAction(workspace, arg, options);

      if (!options.open && !options.homepage && !options.repo) {
        console.log(output);
      }
    }
  }
} catch (error) {
  handleError(error, program.debug);
}
