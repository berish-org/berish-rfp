import { fillChunk, PeerChunk } from '../../chunk';
import { SYMBOL_PEER_SCOPE } from '../../const';
import { PeerDecoratorException } from '../../errors';
import { Peer } from '../peer';
import { sendRaw } from '../sendRaw';
import { sendReject } from './sendReject';

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
      isForce: peer[SYMBOL_PEER_SCOPE].hasBlockers() && incomeChunk.isBlocker,
    });

    await sendRaw(peer, outcomeChunk, incomeChunk);

    peer.logger('peer')('sendResolve').info(outcomeChunk);
  } catch (err) {
    if (typeof err === 'object' && err instanceof PeerDecoratorException) {
      await sendReject(peer, err.err, incomeChunk);
    }
    return void 0;
  }
}
