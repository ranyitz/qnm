const __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
/* eslint-disable no-console */
const child_process_1 = require('child_process');
const commander_1 = __importDefault(require('commander'));
const update_notifier_1 = __importDefault(require('update-notifier'));
const console_1 = require('./actions/helpers/console');
const package_json_1 = __importDefault(require('../package.json'));
const workspace_1 = __importDefault(require('./workspace/workspace'));
const setup_completions_1 = __importDefault(
  require('./completions/setup-completions'),
);
const match_1 = __importDefault(require('./actions/match'));
const get_1 = __importDefault(require('./actions/get'));
const list_1 = __importDefault(require('./actions/list'));
const fuzzy_search_1 = __importDefault(require('./actions/fuzzy-search'));
const handler_error_1 = __importDefault(require('./handler-error'));

update_notifier_1.default({ pkg: package_json_1.default }).notify();
try {
  commander_1.default
    .version(package_json_1.default.version)
    .arguments('[module]', 'prints module version from the node_modules')
    .option(
      '-w, --why',
      'add information regarding why this package was installed',
    )
    .option('-d, --debug', 'see full error messages, mostly for debugging')
    .option('-o, --open', 'open editor at the package.json of a chosen module')
    .option('--disable-colors', 'minimize color and styling usage in output')
    .option('--homepage', "open module's homepage using the default browser");
  commander_1.default
    .command('install-completions')
    .description('attempt to install tab completions using tabtab')
    .action(() => {
      const tabtabCliPath = require.resolve('tabtab/src/cli');
      console_1.clear();
      return child_process_1.spawn('node', [tabtabCliPath, 'install'], {
        stdio: 'inherit',
      });
    });
  commander_1.default
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
      const { disableColors, why } = commander_1.default;
      const workspace = workspace_1.default.loadSync();
      console.log(
        list_1.default(workspace, {
          deps: cmd.deps,
          noColor: disableColors,
          why,
        }),
      );
    });
  commander_1.default
    .command('match <string>')
    .description('prints modules which matches the provided string')
    .option(
      '-w, --why',
      'add information regarding why packages were installed',
    )
    .action(string => {
      const { disableColors, why } = commander_1.default;
      const workspace = workspace_1.default.loadSync();
      console.log(
        match_1.default(workspace, string, { noColor: disableColors, why }),
      );
    });
  commander_1.default.parse(process.argv);
  const preDefinedCommands = commander_1.default.commands.map(c => c._name);
  setup_completions_1.default(preDefinedCommands);
  const workspace = workspace_1.default.loadSync();
  const { why, deps, disableColors, open, homepage } = commander_1.default;
  const options = { why, deps, noColor: disableColors, open, homepage };
  if (commander_1.default.rawArgs.length < 3) {
    fuzzy_search_1.default(workspace, options);
  } else {
    const firstArg = commander_1.default.rawArgs[2];
    if (!preDefinedCommands.includes(firstArg) && firstArg !== 'completion') {
      const [arg] = commander_1.default.args;
      const output = get_1.default(workspace, arg, options);
      if (!options.open && !options.homepage) {
        console.log(output);
      }
    }
  }
} catch (error) {
  handler_error_1.default(error, commander_1.default.debug);
}
//# sourceMappingURL=cli.js.map
