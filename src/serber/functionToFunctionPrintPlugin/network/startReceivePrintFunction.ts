import type { RfpPeer } from '../../../peer';
import type { IFunction, IFunctionPrint } from '../plugin';

import { executeLocalFunction } from './executeLocalFunction';

export function startReceivePrintFunction(
  print: IFunctionPrint,
  localFunction: IFunction,
  peer: RfpPeer,
  thisArg?: any,
) {
  peer.listen(print.printId, async ({ chunk }, next) => {
    const args = chunk.body;
    if (thisArg) localFunction = localFunction.bind(thisArg);
    // const newArgs = getArgumentsValues(print.args, args, request);
    return executeLocalFunction(localFunction, args);
  });
}
