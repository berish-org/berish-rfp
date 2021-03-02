import { RfpPeer } from '../peer';
import { PeerReceive } from '../receiveType';

export function receive<Data extends any = any>(peer: RfpPeer, path: string, callback: PeerReceive<RfpPeer, Data>) {
  return peer.receiveEmitter.on(path, ({ request, next }) => callback(request, next));
}
