import type { IFunction } from '../plugin';

// tslint:disable-next-line: no-var-requires
const fnArgs = require('function-arguments');

export function getPrintArguments(func: IFunction): string[] {
  try {
    const result = fnArgs(func);
    return result || [];
  } catch (err) {
    return [];
  }
}
