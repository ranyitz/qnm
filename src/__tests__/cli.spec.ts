import { execSync } from 'child_process';
import { resolveFixture } from './utils';

const qnmBin = require.resolve('../../bin/qnm');

const runCommand = (
  command: string,
  { cwd, env }: { cwd: string; env?: Record<string, any> },
) =>
  execSync(`${qnmBin} ${command}`, {
    cwd,
    env: {
      ...process.env,
      ...env,
    },
    encoding: 'utf-8',
  });

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

    it('should --disable-colors', () => {
      const cwd = resolveFixture('indirect-dependencies');
      const output = runCommand('list --disable-colors', {
        cwd,
        env: {
          FORCE_COLOR: '1',
        },
      });

      expect(output).toMatchSnapshot();
    });
  });
});
