module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/fixtures/'],
  watchPathIgnorePatterns: ['node_modules'],
  setupFiles: ['./src/__tests__/setup.ts'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
