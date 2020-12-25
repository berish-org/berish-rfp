import { IFunctionPrint, IFunction } from './plugin';
import { RfpPeer, IRfpRequest } from '../../peer';
import { resultFromWithRfp } from './withRfp/resultFromWithRfp';
import { generateError, ErrorTypeEnum } from '../../errors';

export interface IDeferredList {
  [key: string]: () => void;
}

export function startReceivePrintFunction(
  print: IFunctionPrint,
  localFunction: IFunction,
  peer: RfpPeer,
  thisArg?: any,
) {
  peer.listen(print.printId, async ({ chunk }, next) => {
    const args = chunk.body;
    if (thisArg) localFunction = localFunction.bind(thisArg);
    const request: IRfpRequest<any> = { chunk, peer };
    // const newArgs = getArgumentsValues(print.args, args, request);
    return executeLocalFunction(localFunction, args, request);
  });
}

/** Подготовка отпечатка функции к прослушке.
 * Специальный объект активации функций приемки данных от отпечатков функций для того,
 * чтобы отпечатки прослушиавались строго при отправке, а не при инициализации отпечатка
 */
export function deferredReceivePrintFunction(
  print: IFunctionPrint,
  localFunction: IFunction,
  peer: RfpPeer,
  deferredFuncs: IDeferredList,
  thisArg?: any,
) {
  deferredFuncs[print.printId] = () => {
    startReceivePrintFunction(print, localFunction, peer, thisArg);
  };
}

export function deferredReceiveStart(deferredFuncs: IDeferredList) {
  const keys = Object.keys(deferredFuncs);
  for (const key of keys) {
    setImmediate(() => {
      deferredFuncs[key]();
    });
  }
}

/**
 * Метод, который вызывает функцию локально, после того, как пришел сигнал от удаленного пира
 */
export function executeLocalFunction(func: IFunction, newArgs: any[], request: IRfpRequest) {
  return resultFromWithRfp(func(...newArgs), request);
}

/**
 * Метод, который выполняет вызов удаленной функции по отпечатку
 */
export async function executeRemoteFunction(
  peer: RfpPeer,
  print: IFunctionPrint,
  aside: { [key: string]: any },
  executeArgs: any[],
) {
  const { printId } = print;
  if (peer.isConnected) {
    const result = await peer.send({ path: printId, body: executeArgs || [], aside });
    return result.body;
  }
  if (peer.emitter.hasListeners('requestWhenDisconnected')) {
    peer.emitter.emit('requestWhenDisconnected', print);
  }
  throw generateError(ErrorTypeEnum.RFP_DISCONNECTED);
}
