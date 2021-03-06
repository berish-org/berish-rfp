import type { Peer } from '../peer';

export async function waitUnblockAll(peer: Peer) {
  peer.logger('waitUnblockAll').info(peer.blockersChunks.map((m) => m.chunkId));

  // Ждем, когда разблокируются все запросы
  await peer.emitter.waitEvent('unblockAll');
}
