import { fillChunk, PeerChunk } from '../../chunk';
import { SYMBOL_PEER_SCOPE } from '../../const';
import { PeerDecoratorException } from '../../errors';
import { Peer } from '../peer';
import { sendRaw } from '../sendRaw';

export async function sendReject(peer: Peer, outcomeData: any, incomeChunk: PeerChunk<any>) {
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
      isForce: peer[SYMBOL_PEER_SCOPE].hasBlockers() && incomeChunk.isBlocker,
    });

    await sendRaw(peer, outcomeChunk, incomeChunk);

    peer.logger('peer')('sendError').info(outcomeChunk);
  } catch (err) {
    if (typeof err === 'object' && err instanceof PeerDecoratorException) {
      await sendReject(peer, err.err, incomeChunk);
    }
    return void 0;
  }
}
