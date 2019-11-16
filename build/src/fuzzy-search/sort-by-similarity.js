const fuzzysort = require('fuzzysort');

module.exports = (list, string) => {
  return fuzzysort
    .go(string, list, {
      threshold: -20,
      limit: 16,
      allowTypo: true,
    })
    .sort((a, b) => a.score < b.score)
    .map(result => {
      return {
        value: result.target,
        score: result.score,
            highlight: fuzzysort.highlight(result, '\u001b[32m', '\u001b[39m') // eslint-disable-line
      };
    });
};
//# sourceMappingURL=sort-by-similarity.js.map
