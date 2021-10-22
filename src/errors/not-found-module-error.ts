import chalk from 'chalk';
import isEmpty from 'lodash/isEmpty';

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
  constructor(
    name: string,
    suggestions: Array<string>,
    lastModifiedFilter?: string,
  ) {
    const moduleFilterMessage = lastModifiedFilter
      ? ` and the --last-modified filter: "${lastModifiedFilter}"`
      : '';
    let message = `Could not find any module by the name: "${name}"${moduleFilterMessage}.`;

    if (!isEmpty(suggestions)) {
      message += ` Did you mean "${paintDiffInBold(name, suggestions[0])}"?`;
    }

    super(message);
  }
}
