import levenshtein from 'js-levenshtein';

export default (
  input: string,
  options: Array<string>,
  maxDistance: number = 2,
): Array<string> => {
  for (const option of options) {
    if (
      option.startsWith('@') &&
      option.indexOf('/') &&
      option.slice(option.indexOf('/') + 1) === input
    ) {
      return [option];
    }
  }

  return options
    .map((opt) => {
      return [opt, levenshtein(input, opt)] as [string, number];
    })
    .filter(([, distance]) => distance <= maxDistance)
    .sort(([, distanceA], [, distanceB]) => distanceA - distanceB)
    .map(([option]) => option);
};
