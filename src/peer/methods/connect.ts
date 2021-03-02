import { getScope } from '@berish/stateful';
import { PeerInitialConnectionError } from '../../errors';
import type { RfpPeer } from '../peer';
import { disconnect } from './disconnect';
import { checkConnection } from './checkConnection';
import { emit } from './emit';
import { createRequest } from './createRequest';

export async function connect(peer: RfpPeer): Promise<string> {
  const logger = peer.logger;

  try {
    logger.info('connect.start');
    await peer.emitter.emitStateAsync('connect.start', null);

    const connectionId = peer.transport.subscribe(peer, (data) => emit(createRequest(peer, data)));

    const connected = await checkConnection(peer);
    if (!connected) throw new PeerInitialConnectionError();

    await peer.emitter.emitStateAsync('connect.finish', null);
    logger.info('connect.finish');

    return connectionId;
  } catch (err) {
    throw new PeerInitialConnectionError();
  }
}
