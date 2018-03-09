/* eslint-disable no-console */
const prog = require('caporal');
const pkg = require('../package.json');
const Workspace = require('../src/workspace');
const {
  printVersions, printModulesList, notFoundModuleMessage, notMatchModuleMessage, noModulesMessage,
} = require('./printer');
const handlerError = require('./handler-error');
const isEmpty = require('lodash/isEmpty');

prog
  .version(pkg.version)
  .argument('[module]', 'prints module version from the node_modules')
  .option('-v, --verbose', 'Verbose mode - will also output debug messages')
  .option('-m, --match', 'works like grep, and prints modules which the provided string matches')
  .action((args, options) => {
    const { verbose, match } = options;
    const name = args.module;

    if (!name && !match) {
      // prints help in case these are no arguments
      return;
    }

    if (match) {
      try {
        const nm = Workspace.loadSync();
        const modulesList = nm.match(match);
        console.log('');

        if (isEmpty(modulesList)) {
          console.log(notMatchModuleMessage(match));
          return;
        }

        console.log(printModulesList(modulesList, { match }));
      } catch (error) {
        handlerError(error, verbose);
      }

      return;
    }

    try {
      const nm = Workspace.loadSync();
      const modules = nm.get(name);
      console.log('');

      if (isEmpty(modules)) {
        console.log(notFoundModuleMessage(name));
        return;
      }

      console.log(printVersions(modules));
    } catch (error) {
      handlerError(error, verbose);
    }
  })
  .command('list', 'list all node_modules with their versions')
  .alias('ls')
  .option('-v, --verbose', 'Verbose mode - will also output debug messages')
  .action((args, options) => {
    const { verbose } = options;
    try {
      const nm = Workspace.loadSync();
      const modulesList = nm.list();
      console.log('');

      if (isEmpty(modulesList)) {
        console.log(noModulesMessage());
        return;
      }

      console.log(printModulesList(modulesList));
    } catch (error) {
      handlerError(error, verbose);
    }
  });

prog.parse(process.argv);

