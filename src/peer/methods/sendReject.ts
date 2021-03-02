import { send } from './send';
import { createRequest, PeerRequest } from './createRequest';
import { fillChunk } from '../../chunk';

export async function sendReject(incomeRequest: PeerRequest, data: any) {
  const { peer, chunk: incomeChunk } = incomeRequest;

  if (incomeChunk.notWaiting) return void 0;

  const outcomeChunk = fillChunk({
    aside: incomeChunk.aside,
    body: data,
    notWaiting: true,
    path: `${incomeChunk.chunkId}`,
    replyId: incomeChunk.chunkId,
    status: 'reject',
    isForce: peer.hasBlockers && incomeChunk.isBlocker,
  });

  await send(peer, outcomeChunk, incomeChunk);

  peer.logger('peer')('sendError').info(data);
}
