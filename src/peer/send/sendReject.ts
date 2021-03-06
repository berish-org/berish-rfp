import { fillChunk, PeerChunk } from '../../chunk';
import { Peer } from '../peer';
import { sendRaw } from '../sendRaw';

export async function sendReject(peer: Peer, outcomeData: any, incomeChunk: PeerChunk<any>, deep: number = 0) {
  try {
    // Если не ожидает ответ, то ничего не отправляем
    if (incomeChunk.notWaiting) return void 0;

    // Готовим chunk для отправки
    const outcomeChunk = fillChunk({
      aside: incomeChunk.aside,
      body: outcomeData,
      notWaiting: true,
      path: incomeChunk.chunkId,
      status: 'reject',
      isForce: peer.hasBlockers && incomeChunk.isBlocker,
    });

    await sendRaw(peer, outcomeChunk, incomeChunk);

    peer.logger('peer')('sendError').info(outcomeChunk);
  } catch (err) {
    const deepLevel = peer.params.sendRejectDeep || 0;
    if (deep < deepLevel) await sendReject(peer, err, incomeChunk, deep + 1);
    return void 0;
  }
}
