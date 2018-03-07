const path = require('path');
const Workspace = require('../src/workspace');
const chalk = require('chalk');
const { printModules, printModulesList } = require('../src/printer');

const resolveFixture = relativePath => path.resolve(__dirname, 'fixtures', relativePath);

describe('workspace', () => {
  it('should get the version of a single module', () => {
    const nm = Workspace.loadSync(resolveFixture('single-module'));
    const modules = nm.get('test');
    const output = printModules(modules);

    expect(output).toMatch(`> ${chalk.bold('1.0.0')}`);
  });

  it('should get the version of a module in depth', () => {
    const nm = Workspace.loadSync(resolveFixture('module-in-depth'));
    const modules = nm.get('test');
    const output = printModules(modules);

    expect(output).toMatch(`> ${chalk.bold('1.0.0')} ${chalk.magenta('(another)')}`);
  });

  it('should get the version of a single module when not starting at the root', () => {
    const nm = Workspace.loadSync(resolveFixture('single-module/node_modules'));
    const modules = nm.get('test');
    const output = printModules(modules);

    expect(output).toMatch(`> ${chalk.bold('1.0.0')}`);
  });

  it('should get the version of a single module when in an organization package', () => {
    const nm = Workspace.loadSync(resolveFixture('org-module'));
    const modules = nm.get('@org/test');
    const output = printModules(modules);

    expect(output).toMatch(`> ${chalk.bold('1.0.0')}`);
  });

  it('should list the versions of mixed modules', () => {
    const nm = Workspace.loadSync(resolveFixture('mix-modules'));
    const output = printModulesList(nm.modulesMap);

    expect(output).toMatch(`@org/test > ${chalk.bold('1.0.0')}`);
    expect(output).toMatch(`another > ${chalk.bold('1.0.0')}`);
    expect(output).toMatch(`test > ${chalk.bold('1.0.0')}`);
    expect(output).toMatch(`> ${chalk.bold('1.0.0')} ${chalk.magenta('(another)')}`);
  });
});
