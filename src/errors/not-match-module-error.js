module.exports = class NotMatchModuleError extends Error {
  constructor(str) {
    super(`Could not find any module that matches "${str}"`);
  }
};
