import * as qnm from '../..'; // eslint-disable-line import/no-useless-path-segments
import { resolveFixture } from './utils';

describe('Node API', () => {
  describe('qnm <module>]', () => {
    it('should show the version and dependents info on a single module when called with a string', () => {
      const cwd = resolveFixture('single-module');
      const output = qnm.match('test', cwd);

      expect(output).toMatchSnapshot();
    });

    it('should show get matches when using the match command', () => {
      const cwd = resolveFixture('single-module');
      const output = qnm.match('te', cwd);

      expect(output).toMatchSnapshot();
    });

    it('should add dependents information on yarn installed package', () => {
      const cwd = resolveFixture('yarn-install');
      const output = qnm.match('import-from', cwd);

      expect(output).toMatchSnapshot();
    });

    it('should show an indication in case there is a symlink', () => {
      const cwd = resolveFixture('symlink');
      const output = qnm.match('test', cwd);

      expect(output).toMatchSnapshot();
    });

    it('should work in monorepo and print subpackages modules', () => {
      const cwd = resolveFixture('monorepo');
      const output = qnm.match('package-foo', cwd);

      expect(output).toMatchSnapshot();
    });

    it('should work in monorepo with yarn workspaces', () => {
      const cwd = resolveFixture('monorepo-with-workspaces');
      const output = qnm.match('package-foo', cwd);

      expect(output).toMatchSnapshot();
    });

    it('should provide suggestion for scoped package with the same name', () => {
      const cwd = resolveFixture('scoped-package');

      try {
        qnm.match('test', cwd);
      } catch (error) {
        expect(error.message).toMatch('Did you mean "@scope/test"');
      }
    });
  });

  describe('qnm list', () => {
    it('should show all modules in node_modules directory', () => {
      const cwd = resolveFixture('mix-modules');
      const output = qnm.list(cwd);

      expect(output).toMatchSnapshot();
    });

    it('should show modules mentioned in package.json', () => {
      const cwd = resolveFixture('indirect-dependencies');
      const output = qnm.list(cwd, { deps: true });

      expect(output).toMatchSnapshot();
    });

    it('should list dependencies in a yarn installed package and show "why" information', () => {
      const cwd = resolveFixture('yarn-install');
      const output = qnm.list(cwd);

      expect(output).toMatchSnapshot();
    });

    it('should list a monorepo', () => {
      const cwd = resolveFixture('monorepo');
      const output = qnm.list(cwd);

      expect(output).toMatchSnapshot();
    });
  });

  describe('qnm match', () => {
    it('should match in monorepo and print subpackages modules', () => {
      const cwd = resolveFixture('monorepo');
      const output = qnm.match('packa', cwd);

      expect(output).toMatchSnapshot();
    });
  });
});
