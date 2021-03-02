import type { Peer } from '../peer';

export function unreceive(peer: Peer, eventHash: string) {
  peer.receiveEmitter.off(eventHash);
}
