import { getScope } from '@berish/stateful';
import { RfpPeer } from './peer';
import { disconnect } from './disconnect';
import { checkConnection } from './checkConnection';
import { emit } from './emit';
import { PeerInitialConnectionError } from '../errors';

export async function connect(peer: RfpPeer, unsubscribeId: string) {
  if (peer.isConnected) {
    disconnect(peer, unsubscribeId);
  }
  if (!peer.isConnected) {
    unsubscribeId = peer.transport.subscribe(peer, (data) => emit(peer, data));
    const connected = await checkConnection(peer);
    if (!connected) throw new PeerInitialConnectionError();
    peer.logger('peer').info('connected');
  }
  if (peer.store) {
    await peer.store.connect();
  }
  await peer.emitter.emitAsync('connected');
  return unsubscribeId;
}
