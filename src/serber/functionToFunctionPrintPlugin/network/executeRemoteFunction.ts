import type { RfpPeer } from '../../../peer';
import type { IFunctionPrint } from '../plugin';

import { PeerIsDisconnectedError } from '../../../errors';

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
  throw new PeerIsDisconnectedError();
}
