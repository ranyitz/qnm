const path = require('path');
const Workespace = require('../src/workspace/workspace');

module.exports.resolveFixture = fixure =>
  path.resolve(__dirname, './fixtures', fixure);

module.exports.resolveWorkspace = fixure =>
  Workespace.loadSync(exports.resolveFixture(fixure));
