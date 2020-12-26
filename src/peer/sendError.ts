import { IRfpChunk } from './types';
import { send } from './send';
import { RfpPeer } from './peer';

export async function sendError(peer: RfpPeer, incomeChunk: IRfpChunk<any>, data: any) {
  if (!incomeChunk.notWaiting) {
    const outcomeChunk: IRfpChunk<any> = {
      aside: incomeChunk.aside,
      body: data,
      notWaiting: true,
      path: `${incomeChunk.chunkId}`,
      replyId: incomeChunk.chunkId,
      status: 'reject',
      isForce: peer.hasBlockers && incomeChunk.isBlocker,
    };
    await send(peer, outcomeChunk, incomeChunk.path);
    peer.getLogger()('peer')('sendError').info(data);
  }
}
