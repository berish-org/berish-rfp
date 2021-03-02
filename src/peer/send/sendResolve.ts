import { fillChunk, PeerChunk } from '../../chunk';
import { Peer } from '../peer';
import { sendRaw } from '../sendRaw';

export async function sendResolve(peer: Peer, outcomeData: any, incomeChunk: PeerChunk<any>) {
  try {
    // Если не ожидает ответ, то ничего не отправляем
    if (incomeChunk.notWaiting) return void 0;

    // Готовим chunk для отправки
    const outcomeChunk = fillChunk({
      aside: incomeChunk.aside,
      body: outcomeData,
      notWaiting: true,
      path: incomeChunk.chunkId,
      status: 'resolve',
      isForce: peer.hasBlockers && incomeChunk.isBlocker,
    });

    await sendRaw(peer, outcomeChunk, incomeChunk);

    peer.logger('peer')('sendResolve').info(outcomeChunk);
  } catch (err) {
    return void 0;
  }
}
