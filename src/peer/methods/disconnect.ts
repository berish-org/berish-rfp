import type { Peer } from '../peer';

export async function disconnect(peer: Peer, connectionId: string): Promise<void> {
  const logger = peer.logger('peer');

  await peer.emitter.emitStateAsync('disconnect.start', null);

  peer.transport.unsubscribe(connectionId);
  peer.unreceiveAll();

  logger.info('disconnect');

  await peer.emitter.emitStateAsync('disconnect.finish', null);
}
