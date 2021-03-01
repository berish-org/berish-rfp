import { getScope } from '@berish/stateful';
import { RfpPeer } from './peer';

export async function disconnect(peer: RfpPeer, unsubscribeId: string) {
  if (peer.isConnected) {
    peer.transport.unsubscribe(unsubscribeId);
    peer.unlistenAll();
    peer.logger('peer').info('disconnected');

    if (peer.store) {
      peer.store.disconnect();
    }

    await peer.emitter.emitAsync('disconnected');
    peer.emitter.offAll();
  }
}
