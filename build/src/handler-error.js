const __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
/* eslint-disable no-console */
const chalk_1 = __importDefault(require('chalk'));

exports.default = (error, debug) => {
  if (!debug) {
    console.error(chalk_1.default.red(error.message.replace('Error: ', '')));
  } else {
    console.error(error.stack);
  }
  process.exit(1);
};
//# sourceMappingURL=handler-error.js.map
