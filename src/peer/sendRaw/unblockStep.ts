import type { Peer } from '../peer';
import { PeerChunk } from '../../chunk';

export async function unblockStep<Data = any>(peer: Peer, outcomeChunk: PeerChunk<Data>) {
  if (!outcomeChunk.isForce && outcomeChunk.isBlocker) {
    peer.blockersChunks = peer.blockersChunks.filter((m) => m !== outcomeChunk);
    await peer.emitter.emitAsync('unblock', outcomeChunk);
    if (!peer.hasBlockers) await peer.emitter.emitAsync('unblockAll');
  }
}
