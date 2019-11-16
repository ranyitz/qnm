module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '/Users/rany/personal-projects/qnm/src/__tests__/actions/list.spec.ts',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/fixtures/'],
  watchPathIgnorePatterns: ['node_modules'],
  setupFiles: ['./src/__tests__/setup.ts'],
};
