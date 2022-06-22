import Workspace from '../workspace/workspace';
import { CliOptions } from '../cli';
import renderDoctor from '../render/render-doctor';
import { spinner } from '../spinner';

export default async (workspace: Workspace, options: CliOptions = {}) => {
  spinner.start();

  const doctorAnalysis = await workspace.listHeavyModules(options.sort!, 20);

  spinner.stop();

  return renderDoctor(doctorAnalysis);
};
