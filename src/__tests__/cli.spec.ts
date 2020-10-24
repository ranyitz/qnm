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
      FORCE_COLOR: '0',
      ...env,
    },
    encoding: 'utf-8',
  });

describe('CLI', () => {
  describe('qnm <module>]', () => {
    it('should show the version and dependents info on a single module when called with a string', () => {
      const cwd = resolveFixture('single-module');
      const output = runCommand('test', { cwd });

      expect(output).toMatchSnapshot();
    });

    it('should show get matches when using the match command', () => {
      const cwd = resolveFixture('single-module');
      const output = runCommand('match te', { cwd });

      expect(output).toMatchSnapshot();
    });

    it('should add dependents information on yarn installed package', () => {
      const cwd = resolveFixture('yarn-install');
      const output = runCommand('import-from', { cwd });

      expect(output).toMatchSnapshot();
    });

    it('should show an indication in case there is a symlink', () => {
      const cwd = resolveFixture('symlink');
      const output = runCommand('test', { cwd });

      expect(output).toMatchSnapshot();
    });

    it('should work in monorepo and print subpackages modules', () => {
      const cwd = resolveFixture('monorepo');
      const output = runCommand('package-foo', { cwd });

      expect(output).toMatchSnapshot();
    });

    it('should work in monorepo with yarn workspaces', () => {
      const cwd = resolveFixture('monorepo-with-workspaces');
      const output = runCommand('package-foo', { cwd });

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

    it('should list dependencies in a yarn installed package and show "why" information', () => {
      const cwd = resolveFixture('yarn-install');
      const output = runCommand('list', { cwd });

      expect(output).toMatchSnapshot();
    });

    it('should list a monorepo', () => {
      const cwd = resolveFixture('monorepo');
      const output = runCommand('list', { cwd });

      expect(output).toMatchSnapshot();
    });
  });

  describe('qnm match', () => {
    it('should match in monorepo and print subpackages modules', () => {
      const cwd = resolveFixture('monorepo');
      const output = runCommand('match packa', { cwd });

      expect(output).toMatchSnapshot();
    });
  });
});
