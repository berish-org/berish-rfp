import { IRfpChunk } from './types';
import { send } from './send';
import { RfpPeer } from './peer';
import { createRequest, PeerRequest } from './methods';

export async function sendError(request: PeerRequest<RfpPeer, any>, data: any) {
  const { peer, chunk: incomeChunk } = request;
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
    const outcomeRequest = createRequest(peer, outcomeChunk);
    await send(outcomeRequest, incomeChunk.path);
    peer.getLogger()('peer')('sendError').info(data);
  }
}
