import type { Peer } from '../peer';
import { PeerReceive } from '../receiveType';

export function receive<Data extends any = any>(peer: Peer, path: string, callback: PeerReceive<Peer, Data>) {
  return peer.receiveEmitter.on(path, ({ request, next }) => callback(request, next));
}
