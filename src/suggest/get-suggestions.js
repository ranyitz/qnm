const levenshtein = require('js-levenshtein');

module.exports = (input, options, maxDistance = 2) => {
  return options
    .map(opt => {
      return [opt, levenshtein(input, opt)];
    })
    .filter(([, distance]) => distance <= maxDistance)
    .sort(([, distanceA], [, distanceB]) => distanceA - distanceB)
    .map(([option]) => option);
};
