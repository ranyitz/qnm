import chalk from 'chalk';

function paintDiffInBold(from: string, to: string) {
  return to
    .split('')
    .map((char, index) => {
      if (char !== from.charAt(index)) {
        return chalk.bold(char);
      }

      return char;
    })
    .join('');
}

export default class NotFoundModuleError extends Error {
  constructor(name: string, suggestions: Array<string>) {
    let message = `Could not find any module by the name: "${name}".`;

    if (suggestions.length > 0) {
      message += ` Did you mean "${paintDiffInBold(name, suggestions[0])}"?`;
    }

    super(message);
  }
}
