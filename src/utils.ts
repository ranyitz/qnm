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
      'dist-tags': { latest: '3.0.0' },
    };
  }

  if (viewMap.has(packageName)) {
    return viewMap.get(packageName);
  }

  const { stdout, stderr } = execa.sync(`npm`, ['view', packageName, '--json']);
  let remoteDate;
  try {
    remoteDate = JSON.parse(stdout);
  } catch (error) {
    throw new Error(`couldn't parse npm view's output
${stderr}
${error}
    `);
  }

  viewMap.set(packageName, remoteDate);
  return remoteDate;
}
