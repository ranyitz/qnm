/* eslint-disable no-console */
const program = require('commander');

const Workspace = require('../src/workspace/workspace');
const listAction = require('../src/actions/list');


program.parse(process.argv);

const workspace = Workspace.loadSync();
console.log(listAction(workspace));
