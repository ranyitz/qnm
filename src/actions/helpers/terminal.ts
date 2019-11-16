export const clearTerminal = (): void => {
  // do not clear console on testing environment
  process.env.NODE_ENV !== 'test' && process.stdout.write('\x1Bc');
};
