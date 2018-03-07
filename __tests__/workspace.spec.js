const path = require('path');
const Workspace = require('../src/workspace');
const chalk = require('chalk');
const { printModules } = require('../src/printer');

describe('workspace', () => {
  it('should load a workspace and get the version of a single module', () => {
    const nm = Workspace.loadSync(path.resolve(__dirname, './fixtures/single-module'));
    const modules = nm.get('test');
    expect(printModules(modules)).toMatch(`> ${chalk.bold('1.0.0')}`);
  });

  it('should load a workspace and get the version of a module in depth', () => {
    const nm = Workspace.loadSync(path.resolve(__dirname, './fixtures/module-in-depth'));
    const modules = nm.get('test');
    expect(printModules(modules)).toMatch(`> ${chalk.bold('1.0.0')} ${chalk.magenta('(another)')}`);
  });

  it('should load a workspace and get the version of a single module when not starting at the root', () => {
    const nm = Workspace.loadSync(path.resolve(__dirname, './fixtures/single-module/node_modules'));
    const modules = nm.get('test');
    expect(printModules(modules)).toMatch(`> ${chalk.bold('1.0.0')}`);
  });
});
