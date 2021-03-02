import type { Peer } from '../../../peer';
import type { IFunction, IFunctionPrint } from '../plugin';

import { executeLocalFunction } from './executeLocalFunction';

export function startReceivePrintFunction(print: IFunctionPrint, localFunction: IFunction, peer: Peer, thisArg?: any) {
  peer.receive(print.printId, async ({ chunk }) => {
    const args = chunk.body;
    if (thisArg) localFunction = localFunction.bind(thisArg);
    // const newArgs = getArgumentsValues(print.args, args, request);
    return executeLocalFunction(localFunction, args);
  });
}
