import renderVersion from '../../render/render-version';

it('should colorize the first 10 results', () => {
  const actual = [];

  for (let i = 0; i < 11; i++) {
    actual.push(renderVersion('colorTest', i));
  }

  expect(actual).toMatchSnapshot();

  // no more colors from here
  expect(renderVersion('colorTest', 'bar')).toEqual('bar');
  expect(renderVersion('colorTest', 'bar')).toEqual('bar');
});

it('should start colors for each module from the first color', () => {
  expect(renderVersion('colorEqualityTest', 'foo')).toEqual(
    renderVersion('colorEqualityTest2', 'foo'),
  );
});
