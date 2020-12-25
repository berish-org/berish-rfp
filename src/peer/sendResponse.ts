import { RfpPeer } from './peer';
import { IRfpChunk } from './types';
import { send } from './send';

export async function sendResponse(peer: RfpPeer, incomeChunk: IRfpChunk<any>, data: any) {
  if (!incomeChunk.notWaiting) {
    const outcomeChunk: IRfpChunk<any> = {
      aside: incomeChunk.aside,
      body: data,
      notWaiting: true,
      path: `${incomeChunk.chunkId}`,
      replyId: incomeChunk.chunkId,
      status: 'resolve',
      isForce: peer.hasBlockers && incomeChunk.isBlocker,
    };
    await send(peer, outcomeChunk, incomeChunk.path);
    peer
      .getLogger()('peer')('sendResponse')
      .info(data);
  }
}
