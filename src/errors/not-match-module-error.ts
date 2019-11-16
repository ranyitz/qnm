export default class NotMatchModuleError extends Error {
  constructor(str: string) {
    super(`Could not find any module that matches "${str}"`);
  }
}
