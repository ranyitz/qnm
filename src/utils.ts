import fs from 'fs';

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
