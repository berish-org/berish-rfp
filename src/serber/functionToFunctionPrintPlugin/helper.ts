import guid from 'berish-guid';
import { IRfpRequest } from '../../peer';
import { magicalDictionary } from '../../constants';
import { IFunction } from './plugin';

// tslint:disable-next-line: no-var-requires
const fnArgs = require('function-arguments');

export const OriginalFuncSymbol = Symbol('originalFunc');

export function generatePrintId() {
  return guid.guid();
}

export function getPrintName(func: IFunction, synomicName: string | number | symbol, chunkPath: string): string {
  if (synomicName) return synomicName.toString();
  const name =
    typeof func !== 'function'
      ? ''
      : func['displayName'] || func.name || (/function ([^(]+)?\(/.exec(func.toString()) || [])[1];
  return name || chunkPath || 'unknown';
}

export function getPrintArguments(func: IFunction): string[] {
  try {
    const result = fnArgs(func);
    return result || [];
  } catch (err) {
    return [];
  }
}

export function setName(originalFunction: (...args: any[]) => any, name: string) {
  Object.defineProperty(originalFunction, 'name', { value: name });
  return originalFunction;
  // const placeholder = {
  //   [name](...args) {
  //     return originalFunction(...args);
  //   },
  // };
  // return placeholder[name];
}

export function getArgumentsValues(printArgs: any[], argsValue: any[], request: IRfpRequest) {
  return printArgs.map((m, i) => {
    if (m === magicalDictionary.requestArgumentName) return request;
    if (typeof argsValue[i] === 'undefined') return undefined;
    return argsValue[i];
  });
}

export function getAsideFromLocalFunction(func: IFunction) {
  return func[magicalDictionary.contextAsideKey]
    ? { [magicalDictionary.contextAsideKey]: func[magicalDictionary.contextAsideKey] }
    : {};
}
