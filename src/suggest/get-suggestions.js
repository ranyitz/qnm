const levenshtein = require('fast-levenshtein');

module.exports = (input, options, maxDistance = 2) => {
  return options.map((opt) => {
    return [opt, levenshtein.get(input, opt)];
  })
    .filter(([, distance]) => distance <= maxDistance)
    .sort(([, distanceA], [, distanceB]) => distanceA - distanceB)
    .map(([option]) => option);
};

