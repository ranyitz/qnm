const prog = require('caporal');
const pkg = require('../package.json');
const Workspace = require('../src/workspace');

prog
  .version(pkg.version)
  .argument('[module]', 'prints module version from the node_modules')
  .action((args, options, logger) => {
    if (!args.module) {
      console.log(prog._helper.get()); // eslint-disable-line no-console
      return;
    }

    const nm = Workspace.loadSync({ logger });
    const version = nm.getVersion(args.module);
    console.log(version); // eslint-disable-line no-console
  });

prog.parse(process.argv);

