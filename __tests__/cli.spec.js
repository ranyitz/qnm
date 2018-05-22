const { execSync } = require('child_process');
const { resolveFixture } = require('./utils');

const qnmBin = require.resolve('../bin/qnm');
const runCommand = (command, { cwd }) =>
  execSync(`${qnmBin} ${command}`, { cwd, encoding: 'utf-8' });

describe('CLI', () => {
  describe('qnm with no arguments', () => {
    it('should show the version on a single module when called with a string', () => {
      const cwd = resolveFixture('single-module');
      const output = runCommand('test', { cwd });

      expect(output).toMatchSnapshot();
    });

    it('should show get matchs when using the match command', () => {
      const cwd = resolveFixture('single-module');
      const output = runCommand('match te', { cwd });

      expect(output).toMatchSnapshot();
    });

    it('should add dependents information when using thw --why option', () => {
      const cwd = resolveFixture('single-module');
      const output = runCommand('--why test', { cwd });

      expect(output).toMatchSnapshot();
    });

    it('should add dependents information when using thw -w option', () => {
      const cwd = resolveFixture('single-module');
      const output = runCommand('-w test', { cwd });

      expect(output).toMatchSnapshot();
    });
  });

  describe('qnm list', () => {
    it('should show all modules in node_modules directory', () => {
      const cwd = resolveFixture('mix-modules');
      const output = runCommand('list', { cwd });

      expect(output).toMatchSnapshot();
    });

    it('should show modules mentioned in package.json', () => {
      const cwd = resolveFixture('indirect-dependencies');
      const output = runCommand('list --deps', { cwd });

      expect(output).toMatchSnapshot();
    });
  });
});
