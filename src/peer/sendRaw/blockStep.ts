import type { Peer } from '../peer';
import { PeerChunk } from '../../chunk';

import { waitUnblockAll } from './waitUnblockAll';

export async function blockStep<Data = any>(peer: Peer, outcomeChunk: PeerChunk<Data>) {
  // Добавление в список блокирующих запросов
  if (outcomeChunk.isBlocker) {
    peer.blockersChunks.push(outcomeChunk);
  }

  // Ожидание всех блокирующих запросов перед текущим запросом
  if (!outcomeChunk.isForce && peer.hasBlockers) await waitUnblockAll(peer);
}
