import matchAction from '../../actions/match';
import { resolveWorkspace } from '../utils';

describe('match', () => {
  it('should print the matched modules according to passed string', () => {
    const workspace = resolveWorkspace('mix-modules');
    const output = matchAction(workspace, 'anot');

    expect(output).toMatchSnapshot();
  });

  it('should disable colors', () => {
    const workspace = resolveWorkspace('single-module');
    const output = matchAction(workspace, 'tes', {
      noColor: true,
    });

    expect(output).toMatchSnapshot();
  });

  it('should show a message when no module has matched the provided string', () => {
    const workspace = resolveWorkspace('single-module');
    try {
      matchAction(workspace, 'bla');
    } catch (e: any) {
      expect(e.message).toMatchSnapshot();
    }
  });
});
