import type { Peer } from '../peer';
import { PeerChunk } from '../../chunk';
import { SYMBOL_PEER_SCOPE } from '../../const';

export async function unblockStep<Data = any>(peer: Peer, outcomeChunk: PeerChunk<Data>) {
  const scope = peer[SYMBOL_PEER_SCOPE];

  // Если chunk был блоком, то убираем его из списка блокировок
  if (outcomeChunk.isBlocker) {
    scope.removeBlocker(outcomeChunk);
  }
}
