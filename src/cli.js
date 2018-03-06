/* eslint-disable no-console */
const prog = require('caporal');
const pkg = require('../package.json');
const Workspace = require('../src/workspace');
const { printModules } = require('./printer');
const handlerError = require('./handler-error');

prog
  .version(pkg.version)
  .argument('[module]', 'prints module version from the node_modules')
  .option('-v, --verbose', 'Verbose mode - will also output debug messages')
  .action((args, options) => {
    const { verbose } = options;
    const name = args.module;
    if (!name) {
      // prints help in case these are no arguments
      console.log(prog._helper.get());
      return;
    }

    try {
      const nm = Workspace.loadSync();
      const modules = nm.get(name);

      console.log('');
      console.log(printModules(modules));
    } catch (error) {
      handlerError(error, verbose);
    }
  });

prog.parse(process.argv);

