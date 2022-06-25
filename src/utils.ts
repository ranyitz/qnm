import fs from 'fs';
import execa from 'execa';
import type { RemoteData } from './workspace/node-module';

export function isTruthy<T>(x: T | undefined | null): x is T {
  return x !== undefined && x !== null;
}

export function readLinkSilent(p: string): string | null {
  try {
    return fs.readlinkSync(p);
  } catch (error) {
    return null;
  }
}

const viewMap = new Map();

export function npmView(packageName: string): RemoteData {
  if (process.env.NODE_ENV === 'test') {
    return {
      time: {
        created: Date.now().toString(),
        modified: Date.now().toString(),
      },
      versions: ['2.3.4', '3.0.0'],
      'dist-tags': { latest: '3.0.0' },
    };
  }

  if (viewMap.has(packageName)) {
    return viewMap.get(packageName);
  }

  let remoteDate;

  try {
    const { stdout, stderr } = execa.sync(
      `npm`,
      ['view', packageName, '--json'],
      { timeout: 10000 }
    );

    try {
      remoteDate = JSON.parse(stdout);
    } catch (error) {
      throw new Error(`couldn't parse npm view's output
  ${stderr}
  ${error}
    `);
    }
  } catch (error) {
    if ((error as any).stderr.includes('404')) {
      const summary = (error as any).stderr.split('\n')[1];
      throw new Error(
        `qnm couldn'd get remote data for this package, because it doesn't exist on the registry\n\n` +
          summary
      );
    }

    throw new Error(
      `qnm couldn't get remote data, please check your connection to the npm registry\n\n` +
        (error as Error).message.split('\n')[0]
    );
  }

  viewMap.set(packageName, remoteDate);
  return remoteDate;
}

/**
 * except a yarn3 array of reasons for a module to be installed
 * and return them deduped and simplified
 *
 * input: [
 * 'cacache',
 * 'fs-minipass@npm:^2.0.0, fs-minipass',
 * 'minizlib@npm:^2.1.1, minizlib',
 * 'tar@npm:^6.1.11, tar'
 * ]
 *
 * output: [
 * 'cacache',
 * 'fs-minipass',
 * 'minizlib',
 * 'tar'
 * ]
 * @param moduleName
 * @param requiredByInfo
 * @returns simplifiedRequiredByInfo
 */
export function simplifyRequiredByInfo(
  moduleName: string,
  requiredByInfo: Array<string>
): Array<string> {
  return [
    ...new Set(
      requiredByInfo.flatMap((el) => [
        ...new Set(el.split(', ').map((name) => name.split('@npm:')[0])),
      ])
    ),
  ].map((modulePath) => {
    if (modulePath === '/') {
      return 'dependencies';
    } else if (modulePath === '#DEV:/') {
      return 'devDependencies';
    } else if (modulePath === '#USER') {
      return `npm install ${moduleName}`;
    }

    // npm sometimes starts with requiredBy with `/`
    return modulePath.startsWith('/') ? modulePath.slice(1) : modulePath;
  });
}
