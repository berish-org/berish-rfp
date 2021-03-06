import type { Peer } from '../peer';
import { PeerChunk } from '../../chunk';

import { waitUnblockAll } from './waitUnblockAll';

export async function blockStep<Data = any>(peer: Peer, outcomeChunk: PeerChunk<Data>) {
  // Ожидание всех блокирующих запросов перед текущим запросом
  if (!outcomeChunk.isForce && peer.hasBlockers) await waitUnblockAll(peer);

  // Добавление в список блокирующих запросов
  if (!outcomeChunk.isForce && outcomeChunk.isBlocker) {
    peer.blockersChunks.push(outcomeChunk);
    // await peer.emitter.emitAsync('block', outcomeChunk);
  }
}
