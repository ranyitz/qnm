/* eslint-disable no-console */
import fs from 'fs';
import { spawn } from 'child_process';
import program, { Command } from 'commander';
import { clearTerminal } from './actions/helpers/terminal';
import Workspace from './workspace/workspace';
import setupCompletions from './completions/setup-completions';
import matchAction from './actions/match';
import getAction from './actions/get';
import listAction from './actions/list';
import fuzzySearchAction from './actions/fuzzy-search';
import handleError from './handler-error';
import updateNotifier from 'update-notifier';

const pkgJsonPath = require.resolve('../package.json');
const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));

updateNotifier({ pkg }).notify();

export type CliOptions = {
  deps?: boolean;
  noColor?: boolean;
  open?: boolean;
  homepage?: boolean;
  match?: string;
};

try {
  program
    .version(pkg.version)
    //@ts-ignore
    .arguments('[module]', 'prints module version from the node_modules')
    .option('-d, --debug', 'see full error messages, mostly for debugging')
    .option('-o, --open', 'open editor at the package.json of a chosen module')
    .option('--disable-colors', 'minimize color and styling usage in output')
    .option('--homepage', "open module's homepage using the default browser");

  program
    .command('install-completions')
    .description('attempt to install tab completions using tabtab')
    .action(() => {
      const tabtabCliPath = require.resolve('tabtab/src/cli');
      clearTerminal();

      return spawn('node', [tabtabCliPath, 'install'], { stdio: 'inherit' });
    });

  program
    .command('list')
    .description('list all node_modules with their versions')
    .option(
      '--deps',
      'list dependencies and devDependencies based on package.json.'
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

  const preDefinedCommands = program.commands.map((c: Command) => c._name);

  setupCompletions(preDefinedCommands);

  const workspace = Workspace.loadSync();

  const { deps, disableColors, open, homepage } = program;

  const options: CliOptions = {
    deps,
    noColor: disableColors,
    open,
    homepage,
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

      if (!options.open && !options.homepage) {
        console.log(output);
      }
    }
  }
} catch (error) {
  handleError(error, program.debug);
}
