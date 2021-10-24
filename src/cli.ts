/* eslint-disable no-console */
import { spawn } from 'child_process';
import { program } from 'commander';
import updateNotifier from 'update-notifier';
import { clearTerminal } from './actions/helpers/terminal';
import Workspace from './workspace/workspace';
import setupCompletions from './completions/setup-completions';
import matchAction from './actions/match';
import getAction from './actions/get';
import listAction from './actions/list';
import fuzzySearchAction from './actions/fuzzy-search';
import handleError from './handler-error';
import { getCustomHelp } from './custom-help';

const pkg = require('../package.json');

updateNotifier({ pkg }).notify();

export type CliOptions = {
  deps?: boolean;
  noColor?: boolean;
  open?: boolean;
  homepage?: boolean;
  repo?: boolean;
  match?: string;
  disableColors?: boolean;
  remote?: string;
};

try {
  program.addHelpText('after', getCustomHelp());

  // global program options goes here
  program
    .version(pkg.version, '-v, --version', 'output the current version')
    .option('-d, --debug', 'see full error messages, mostly for debugging')
    .option('-o, --open', 'open editor at the package.json of a chosen module')
    .option('--disable-colors', 'minimize color and styling usage in output')
    .option('--homepage', "open module's homepage using the default browser")
    .option(
      '--repo',
      "open module's repository in the default browser if present",
    )
    .option('--remote', 'fetch remote data')
    .option('--no-remote', 'do not fetch remote data');

  program
    .command('default', { isDefault: true })
    .allowUnknownOption()
    .arguments('[module]')
    .description('prints module version from the node_modules', {
      module: 'name of the npm package to search for',
    })
    .option('--no-remote', 'do not fetch remote data');

  program
    .command('install-completions')
    .description('attempt to install tab completions using tabtab')
    .action(() => {
      const tabtabCliPath = require.resolve('tabtab/src/cli');

      clearTerminal();

      spawn('node', [tabtabCliPath, 'install'], { stdio: 'inherit' });
      process.exit(0);
    });

  program
    .command('list')
    .description('list all node_modules with their versions')
    .option(
      '--deps',
      'list dependencies and devDependencies based on package.json.',
    )
    .option('--remote', 'fetch remote data')
    .action(() => {
      const options = program.opts();

      const workspace = Workspace.loadSync({});

      console.log(
        listAction(workspace, {
          deps: options.deps,
          noColor: options.disableColors,
          remote: options.remote,
        }),
      );

      process.exit(0);
    });

  program
    .command('match <string>')
    .description('prints modules which matches the provided string')
    .option('--remote', 'fetch remote data')
    .action((string) => {
      const workspace = Workspace.loadSync();
      const options = program.opts();

      console.log(
        matchAction(workspace, string, {
          noColor: options.disableColors,
          remote: options.remote,
        }).slice(0, -1),
      );
      process.exit(0);
    });

  program.parse(process.argv);

  const preDefinedCommands = program.commands.map((c) => c.name());

  setupCompletions(preDefinedCommands);

  const workspace = Workspace.loadSync();

  const { deps, disableColors, open, homepage, repo, remote } = program.opts();

  const options: CliOptions = {
    deps,
    noColor: disableColors,
    open,
    homepage,
    repo,
    remote: remote === undefined ? true : remote,
  };

  if (program.args.filter((arg: string) => !arg.startsWith('-')).length === 0) {
    fuzzySearchAction(workspace, options);
  } else {
    const firstArg = program.args[2];

    if (!preDefinedCommands.includes(firstArg) && firstArg !== 'completion') {
      const [arg] = program.args;
      const output = getAction(workspace, arg, options);

      if (!options.open && !options.homepage && !options.repo) {
        if (output) {
          console.log(output.slice(0, -1));
        }
        process.exit(0);
      }
    }
  }
} catch (error: any) {
  handleError(error, program.opts().debug);
}
