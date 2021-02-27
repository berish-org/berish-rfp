import type { PeerChunk } from '../chunk';
import { send } from './send';
import { RfpPeer } from './peer';
import { createRequest, PeerRequest } from './methods';

export async function sendError(request: PeerRequest<RfpPeer, any>, data: any) {
  const { peer, chunk: incomeChunk } = request;
  if (!incomeChunk.notWaiting) {
    const outcomeChunk: PeerChunk<any> = {
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
    peer.logger('peer')('sendError').info(data);
  }
}
