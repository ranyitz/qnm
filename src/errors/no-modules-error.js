module.exports = class NotMatchModuleError extends Error {
  constructor() {
    super('Could not find any module in the node_modules directory');
  }
};
