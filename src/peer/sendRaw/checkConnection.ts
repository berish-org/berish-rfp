import { PeerChunk } from '../../chunk';
import { ConnectionError } from '../../errors';
import { Peer } from '../peer';

/**
 * Возвращает true, если есть соединение.
 * Возвращает false если соединения нет, и продолжать запрос не надо.
 * Возвращает ошибку, если запрос должен быть исполнен, но соединения нет.
 */
export function checkConnection(peer: Peer, outcomeChunk: PeerChunk<any>) {
  if (!peer.connection) {
    if (outcomeChunk.notWaiting) return false;
    else throw new ConnectionError('Peer is disconnected');
  }

  return true;
}
