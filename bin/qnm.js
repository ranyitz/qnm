#! /usr/bin/env node

const NodeModules = require('../src/index');

const nm = NodeModules.loadSync();

const v = nm.getVersion(process.argv[2]);

console.log(v);
