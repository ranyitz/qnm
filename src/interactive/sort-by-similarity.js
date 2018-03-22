const fuzzysort = require('fuzzysort');

module.exports = (list, string) => {
  return fuzzysort
    .go(string, list, {
      threshold: -20, // Don't return matches worse than this (higher is faster)
      limit: Infinity, // Don't return more results than this (lower is faster)
      allowTypo: true, // Allwos a snigle transpoes (false is faster)
    })
    .sort((a, b) => a.score > b.score)
    .map(result => {
      return {
        value: result.target,
        score: result.score,
        highlight: fuzzysort.highlight(result, '\u001b[32m', '\u001b[39m') // eslint-disable-line
      };
    });
};
