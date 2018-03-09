#! /usr/bin/env node

/* eslint-disable no-console */
const program = require('commander');
const pkg = require('../package.json');
const Workspace = require('../src/workspace/workspace');
const setupCompletions = require('../src/completions/setup-completions');

const matchAction = require('../src/actions/match');
const getAction = require('../src/actions/get');

program
  .version(pkg.version)
  .arguments('[module]', 'prints module version from the node_modules')
  .option('-m, --match', 'works like grep, and prints modules which the provided string matches')
  .command('list', 'list all node_modules with their versions');

program.parse(process.argv);

// if no arguments specified, show help
if (program.args.length === 0) {
  program.help();
}

const preDefinedCommands = program.commands.map(c => c._name);

if (!preDefinedCommands.includes(program.args[0]) && program.args[0] !== 'completion') {
  const arg = program.args[0];
  const { match } = program;

  const workspace = Workspace.loadSync();

  if (match) {
    console.log(matchAction(workspace, arg));
  } else {
    console.log(getAction(workspace, arg));
  }
}

setupCompletions(preDefinedCommands);
