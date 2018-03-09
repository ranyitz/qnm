/* eslint-disable no-console */
const prog = require('caporal');
const pkg = require('../package.json');
const Workspace = require('../src/workspace/workspace');

const matchAction = require('./actions/match');
const getAction = require('./actions/get');
const listAction = require('./actions/list');

prog
  .version(pkg.version)
  .argument('[module]', 'prints module version from the node_modules')
  .option('-m, --match', 'works like grep, and prints modules which the provided string matches')
  .action((args, options) => {
    const { match } = options;
    const name = args.module;
    const workspace = Workspace.loadSync();

    if (!name && !match) {
      // prints help in case these are no arguments
      console.log(prog._helper.get());
      return;
    }

    if (match) {
      console.log(matchAction(workspace, match));
      return;
    }

    console.log(getAction(workspace, name));
  })
  .command('list', 'list all node_modules with their versions')
  .alias('ls')
  .action(() => {
    const workspace = Workspace.loadSync();

    console.log(listAction(workspace));
  });

prog.parse(process.argv);

