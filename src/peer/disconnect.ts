import { getScope } from '@berish/stateful';
import { RfpPeer } from './peer';

export async function disconnect(peer: RfpPeer, unsubscribeId: string) {
  if (peer.isConnected) {
    peer.transport.unsubscribe(unsubscribeId);
    peer.unlistenAll();
    peer.logger('peer').info('disconnected');

    const publicScope = getScope(peer.publicStore);
    if (publicScope && publicScope.isConnected) publicScope.disconnect();

    const privateScope = getScope(peer.privateStore);
    if (privateScope && privateScope.isConnected) privateScope.disconnect();

    const protectedScope = getScope(peer.protectedStore);
    if (protectedScope && protectedScope.isConnected) protectedScope.disconnect();

    await peer.emitter.emitAsync('disconnected');
    peer.emitter.offAll();
  }
}
