import type { Peer } from '../peer';

export async function disconnect(peer: Peer) {
  if (!peer) throw new TypeError('PeerConnection disconnect peer is null');

  peer.unreceiveAll();
}
