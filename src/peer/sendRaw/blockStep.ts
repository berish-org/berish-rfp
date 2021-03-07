import type { Peer } from '../peer';
import { PeerChunk } from '../../chunk';
import { SYMBOL_PEER_SCOPE } from '../../const';

export async function blockStep<Data = any>(peer: Peer, outcomeChunk: PeerChunk<Data>) {
  const scope = peer[SYMBOL_PEER_SCOPE];

  // Добавление в список блокирующих запросов
  if (outcomeChunk.isBlocker) {
    scope.addBlocker(outcomeChunk);
  }

  // Ожидание всех блокирующих запросов перед текущим запросом
  if (!outcomeChunk.isForce) {
    // Ждем когда разблокируются все блокирующие запросы до текущего
    await scope.waitBeforeUnblock(outcomeChunk);
  }
}
