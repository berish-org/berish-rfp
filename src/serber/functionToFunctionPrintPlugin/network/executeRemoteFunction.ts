import type { Peer } from '../../../peer';
import type { IFunctionPrint } from '../plugin';

import { ConnectionError } from '../../../errors';

/**
 * Метод, который выполняет вызов удаленной функции по отпечатку
 */
export async function executeRemoteFunction(
  peer: Peer,
  print: IFunctionPrint,
  aside: { [key: string]: any },
  executeArgs: any[],
) {
  const { printId } = print;
  if (peer.isConnected) {
    const result = await peer.send({ path: printId, body: executeArgs || [], aside });
    return result.body;
  }
  throw new ConnectionError('Peer is disconnected');
}
