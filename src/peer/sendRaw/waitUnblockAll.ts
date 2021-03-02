import type { Peer } from '../peer';

export function waitUnblockAll(peer: Peer) {
  peer.logger('waitUnblockAll').info(peer.blockersChunks.map((m) => m.chunkId));

  return peer.emitter.waitEvent('unblockAll');
}
