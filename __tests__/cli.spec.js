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

      expect(output).toMatch(`test
└── 1.0.0`);
    });

    it('should show get matchs when using the --match option', () => {
      const cwd = resolveFixture('single-module');
      const output = runCommand('--match te', { cwd });

      expect(output).toMatch(`test
└── 1.0.0`);
    });

    it('should show get matchs when using the -m option', () => {
      const cwd = resolveFixture('single-module');
      const output = runCommand('-m te', { cwd });

      expect(output).toMatch(`test
└── 1.0.0`);
    });

    it('should add dependents information when using thw --why option', () => {
      const cwd = resolveFixture('single-module');
      const output = runCommand('--why test', { cwd });

      expect(output).toMatch(`test
└── 1.0.0 (devDependencies, npm install test)`);
    });

    it('should add dependents information when using thw -w option', () => {
      const cwd = resolveFixture('single-module');
      const output = runCommand('-w test', { cwd });

      expect(output).toMatch(`test
└── 1.0.0 (devDependencies, npm install test)`);
    });

    describe('JSON output', () => {
      it('should output a single module version in JSON when using the --json flag', () => {
        const cwd = resolveFixture('single-module');
        const output = runCommand('test --json', { cwd });

        expect(JSON.parse(output)).toMatchObject({
          name: 'test',
          version: '1.0.0',
        });
      });

      it('should work with the --match options', () => {
        const cwd = resolveFixture('single-module');
        const output = runCommand('-m te --json', { cwd });

        expect(JSON.parse(output)).toMatchObject([
          {
            name: 'test',
            version: '1.0.0',
          },
        ]);
      });

      it('should work with the --why option', () => {
        const cwd = resolveFixture('single-module');
        const output = runCommand('test --why --json', { cwd });

        expect(JSON.parse(output)).toMatchObject({
          name: 'test',
          version: '1.0.0',
          whyInfo: ['devDependencies', 'npm install test'],
        });
      });
    });
  });

  describe('qnm list', () => {
    it('should show all modules in node_modules directory', () => {
      const cwd = resolveFixture('mix-modules');
      const output = runCommand('list', { cwd });

      expect(output).toMatch(`@scope/test
└── 1.0.0

another
└── 1.0.0

test
├── 1.0.0
└─┬ another
  └── 1.0.0`);
    });

    it('should output results as JSON when providing the --json flag', () => {
      const cwd = resolveFixture('mix-modules');
      const output = runCommand('list --json-output', { cwd });

      expect(JSON.parse(output)).toMatchObject([
        {
          name: '@scope/test',
          version: '1.0.0',
        },
        {
          name: 'another',
          version: '1.0.0',
        },
        {
          name: 'test',
          version: '1.0.0',
          dependents: [
            {
              name: 'another',
              version: '1.0.0',
            },
          ],
        },
      ]);
    });
  });
});
