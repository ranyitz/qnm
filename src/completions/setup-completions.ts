import tabtab from 'tabtab';
import Workspace from '../workspace/workspace';

export default (preDefinedCommands: Array<string>) => {
  const tab = tabtab({ cache: false });

  tab.on(
    'qnm',
    (data: { words: number }, done: (a?: null, b?: Array<string>) => {}) => {
      if (data.words !== 1) {
        return done();
      }

      const tabtabCommands = preDefinedCommands.map(
        command => `${command}:command`,
      );

      try {
        const workspace = Workspace.loadSync();
        const modulesNames = workspace.getModulesNames();

        return done(null, tabtabCommands.concat(modulesNames));
      } catch (error) {
        return done(null, tabtabCommands);
      }
    },
  );

  tab.start();
};
