import type { IFunction } from '../plugin';

export function getPrintName(func: IFunction, synomicName: string | number | symbol, chunkPath: string): string {
  if (synomicName) return synomicName.toString();
  const name =
    typeof func !== 'function'
      ? ''
      : func['displayName'] || func.name || (/function ([^(]+)?\(/.exec(func.toString()) || [])[1];
  return name || chunkPath || 'unknown';
}
