module.exports.clear = () => {
  // do not clear console on testing environment
  return process.env.NODE_ENV !== 'test' && process.stdout.write('\x1Bc');
};
