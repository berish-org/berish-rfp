import { ConnectionError } from '../../errors';
import type { Peer } from '../peer';
import { checkConnection } from './checkConnection';
import { emit } from './emit';
import { createRequest } from './createRequest';

export async function connect(peer: Peer): Promise<string> {
  const logger = peer.logger;

  try {
    logger.info('connect.start');
    await peer.emitter.emitStateAsync('connect.start', null);

    const connectionId = peer.transport.subscribe(peer, (data) => emit(createRequest(peer, data)));

    const connected = await checkConnection(peer);
    if (!connected) throw new ConnectionError('Peer can`t to connect');

    await peer.emitter.emitStateAsync('connect.finish', null);
    logger.info('connect.finish');

    return connectionId;
  } catch (err) {
    throw new ConnectionError('Peer connect error');
  }
}
