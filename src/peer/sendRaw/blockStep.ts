import type { Peer } from '../peer';
import { PeerChunk } from '../../chunk';

import { waitUnblockAll } from './waitUnblockAll';

export async function blockStep<Data = any>(peer: Peer, outcomeChunk: PeerChunk<Data>) {
  const needToWaitUnblockAll = !outcomeChunk.isForce && peer.hasBlockers;

  // Добавление в список блокирующих запросов
  if (outcomeChunk.isBlocker) {
    peer.blockersChunks.push(outcomeChunk);
  }

  // Ожидание всех блокирующих запросов перед текущим запросом
  if (needToWaitUnblockAll) await waitUnblockAll(peer);
}
