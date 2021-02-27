import type { IFunction } from '../plugin';

/**
 * Метод, который вызывает функцию локально, после того, как пришел сигнал от удаленного пира
 */
export function executeLocalFunction(func: IFunction, newArgs: any[]) {
  return func(...newArgs);
}
