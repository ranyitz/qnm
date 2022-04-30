import chalk from 'chalk';
import stripAnsi from 'strip-ansi';

type DoctorAnalysis = Array<[string?, number?, number?]>;

function padEnd(string: string, total: number, padString: string): string {
  const length = stripAnsi(string).length;
  if (length > total) {
    return string;
  }

  const padding = total - length;
  return string + new Array(padding).fill(padString).join('');
}

function renderCount(num: number, padding: number) {
  let mark = ' ';

  if (num === 1) {
    mark = chalk.dim.green('✓ ');
  } else if (num > 1 && num < 9) {
    mark = chalk.dim.yellow('😠');
  } else if (num >= 9 && num < 30) {
    mark = chalk.dim.red('😡');
  } else if (num >= 30 && num < 100) {
    mark = chalk.dim.red('😖');
  } else if (num >= 100) {
    mark = chalk.dim.red('😥');
  }

  return num.toString().padStart(padding, ' ') + ' ' + mark;
}
export default (doctorAnalysis: DoctorAnalysis): string => {
  const maxSize = Math.max(
    ...doctorAnalysis.map(([, size]) => {
      return size!;
    })
  );

  const sizePadding = Math.round(maxSize).toString().length + 5;

  const maxCount = Math.max(
    ...doctorAnalysis.map(([, , count]) => {
      return count!;
    })
  );

  const countPadding = Math.round(maxCount).toString().length;
  const countSpacing = countPadding < 2 ? 0 : countPadding - 2;
  const countSpacingAfter = countPadding === 1 ? '' : ' ';

  const header =
    chalk.bold('size'.padEnd(sizePadding, ' ')) +
    Array(countSpacing).fill(' ').join('') +
    chalk.bold('count') +
    countSpacingAfter +
    chalk.bold(' module');

  const subHeader =
    Array(sizePadding - 2)
      .fill('-')
      .join('') +
    Array(countPadding).fill(' ').join('') +
    Array(5).fill('-').join('') +
    '  ' +
    Array(10).fill('-').join('');

  return [
    header,
    subHeader,
    ...doctorAnalysis.map(([name, sizeInMB, count]) => {
      return `${padEnd(
        `${sizeInMB}${chalk.dim('mb')}`,
        sizePadding,
        ' '
      )} ${renderCount(count!, countPadding)} ${name}`;
    }),
  ].join('\n');
};
