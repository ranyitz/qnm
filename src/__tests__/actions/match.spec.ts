import matchAction from '../../actions/match';
import { resolveWorkspace } from '../utils';

describe('match', () => {
  it('should print the matched modules according to passed string', () => {
    const workspace = resolveWorkspace('mix-modules');
    const output = matchAction(workspace, 'anot');

    expect(output).toMatchSnapshot();
  });

  it('should disable colors', () => {
    const workspace = resolveWorkspace('mix-modules');
    const output = matchAction(workspace, 'anot', {
      noColor: true,
    });

    expect(output).toMatchSnapshot();
  });

  it('should show why info', () => {
    const workspace = resolveWorkspace('single-module');
    const output = matchAction(workspace, 'tes', {
      why: true,
    });

    expect(output).toMatchSnapshot();
  });

  it('should show a message when no module has matched the provided string', () => {
    const workspace = resolveWorkspace('single-module');
    try {
      matchAction(workspace, 'bla');
    } catch (e) {
      expect(e.message).toMatchSnapshot();
    }
  });
});
