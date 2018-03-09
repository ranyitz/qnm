const Workspace = require('../workspace/workspace');
const tabtab = require('tabtab');

module.exports = (preDefinedCommands) => {
  const tab = tabtab({ cache: false });

  tab.on('qnm', (data, done) => {
    if (data.words !== 1) {
      return done();
    }

    const tabtabCommands = preDefinedCommands.map(command => `${command}:command`);

    try {
      const workspace = Workspace.loadSync();
      const modulesNames = workspace.getModulesNames();

      return done(null, tabtabCommands.concat(modulesNames));
    } catch (error) {
      return done(null, tabtabCommands);
    }
  });

  tab.start();
};

