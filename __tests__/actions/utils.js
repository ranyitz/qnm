const path = require('path');
const Workespace = require('../../src/workspace');

const resolveFixture = fixure => path.resolve(__dirname, '../fixtures', fixure);

module.exports.resolveWorkspace = fixure => Workespace.loadSync(resolveFixture(fixure));
