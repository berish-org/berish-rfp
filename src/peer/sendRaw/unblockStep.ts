import type { Peer } from '../peer';
import { PeerChunk } from '../../chunk';

export async function unblockStep<Data = any>(peer: Peer, outcomeChunk: PeerChunk<Data>) {
  // Если chunk был блоком, то убираем его из списка блокировок
  if (outcomeChunk.isBlocker) {
    peer.blockersChunks = peer.blockersChunks.filter((m) => m !== outcomeChunk);
  }

  if (!peer.hasBlockers) await peer.emitter.emitAsync('unblockAll');
}
