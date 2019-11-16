import fuzzysort from 'fuzzysort';

export default (list: Array<string>, string: string) => {
  return (
    fuzzysort
      .go(string, list, {
        threshold: -20, // Don't return matches worse than this (higher is faster)
        limit: 16, // Don't return more results than this (lower is faster)
        allowTypo: true, // Allwos a snigle transpoes (false is faster)
      })
      // @ts-ignore
      .sort((a, b) => a.score < b.score)
      .map((result: Fuzzysort.Result) => {
        return {
          value: result.target,
          score: result.score,
          highlight: fuzzysort.highlight(result, '\u001b[32m', '\u001b[39m'),
        };
      })
  );
};
