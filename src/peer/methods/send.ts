import type { RfpPeer } from '../peer';
import { fillChunk, PeerChunk } from '../../chunk';

import { DeferredReceiveList, deferredReceiveStart } from '../../serber';

import { createRequest } from './createRequest';
import { waitUnblockAll } from './waitUnblockAll';
import { wait } from './wait';
import { serberSerialize } from './serberSerialize';

export async function send<Resolve = any, Data = any>(
  peer: RfpPeer,
  outcomeChunk: PeerChunk<Data>,
  incomeChunk?: PeerChunk<any>,
) {
  outcomeChunk = outcomeChunk && fillChunk(outcomeChunk);
  incomeChunk = incomeChunk && fillChunk(incomeChunk);

  const outcomeRequest = outcomeChunk && createRequest(peer, outcomeChunk);
  const incomeRequest = incomeChunk && createRequest(peer, incomeChunk);

  if (!outcomeChunk.isForce && peer.hasBlockers) await waitUnblockAll(peer);

  if (!outcomeChunk.isForce && outcomeChunk.isBlocker) {
    peer.blockersChunks.push(outcomeChunk);
    await peer.emitter.emitAsync('block', outcomeChunk);
  }

  const deferredList: DeferredReceiveList = {};
  const outcomeRawChunk = serberSerialize(outcomeRequest, deferredList, incomeRequest);
  deferredReceiveStart(deferredList);

  peer.transport.send(peer, outcomeRawChunk);
  peer.logger('peer')('send').info(outcomeRawChunk);

  if (outcomeChunk.notWaiting) {
    peer.logger('peer')('send')('notWait').info(outcomeRawChunk.chunkId);
    return void 0;
  }

  peer.logger('peer')('send')('wait').info(outcomeRawChunk);

  const result = await wait<Resolve, PeerChunk<Data>>(peer, outcomeChunk);
  if (!outcomeChunk.isForce && outcomeChunk.isBlocker) {
    peer.blockersChunks = peer.blockersChunks.filter((m) => m !== outcomeChunk);
    await peer.emitter.emitAsync('unblock', outcomeChunk);
    if (!peer.hasBlockers) await peer.emitter.emitAsync('unblockAll');
  }

  return result;
}
