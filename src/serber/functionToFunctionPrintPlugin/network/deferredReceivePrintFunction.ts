import type { Peer } from '../../../peer';
import type { IFunction, IFunctionPrint } from '../plugin';
import type { DeferredReceiveList } from './deferredReceiveStart';

import { startReceivePrintFunction } from './startReceivePrintFunction';

/** Подготовка отпечатка функции к прослушке.
 * Специальный объект активации функций приемки данных от отпечатков функций для того,
 * чтобы отпечатки прослушиавались строго при отправке, а не при инициализации отпечатка
 */
export function deferredReceivePrintFunction(
  print: IFunctionPrint,
  localFunction: IFunction,
  peer: Peer,
  deferredFuncs: DeferredReceiveList,
  thisArg?: any,
) {
  deferredFuncs[print.printId] = () => {
    startReceivePrintFunction(print, localFunction, peer, thisArg);
  };
}
