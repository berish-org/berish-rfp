import guid from 'berish-guid';
import { RfpPeer } from './peer';
import { PeerRequest } from './methods';
import { IRfpChunk } from './types';
import { DeferredReceiveList, deferredReceiveStart } from '..';
import { serberSerialize } from './serberSerialize';
import { waitUnblockAll } from './waitUnblockAll';
import { wait } from './wait';

export async function send<Resolve = any, Data = any>(request: PeerRequest<RfpPeer, Data>, replyPath?: string) {
  const { chunk: outcomeChunk, peer } = request;
  outcomeChunk.chunkId = outcomeChunk.chunkId || guid.guid();
  outcomeChunk.aside = outcomeChunk.aside || ({} as any);
  outcomeChunk.status = outcomeChunk.status || 'initial';
  outcomeChunk.notWaiting = !!outcomeChunk.notWaiting;
  outcomeChunk.isBlocker = !!outcomeChunk.isBlocker;
  outcomeChunk.isForce = !!outcomeChunk.isForce;

  if (!outcomeChunk.isForce && peer.hasBlockers) {
    await waitUnblockAll(peer);
  }

  if (!outcomeChunk.isForce && outcomeChunk.isBlocker) {
    peer.blockersChunks.push(outcomeChunk);
    peer.emitter.emit('block', outcomeChunk);
  }

  const deferredList: DeferredReceiveList = {};
  const outcomeRawChunk = serberSerialize(request, deferredList, replyPath);
  deferredReceiveStart(deferredList);

  peer.transport.send(peer, outcomeRawChunk);
  peer.logger('peer')('send').info(outcomeRawChunk);

  if (outcomeChunk.notWaiting) {
    peer.logger('peer')('send')('notWait').info(outcomeRawChunk.chunkId);
    return void 0;
  }

  peer.logger('peer')('send')('wait').info(outcomeRawChunk);

  const result = await wait<Resolve, IRfpChunk<Data>>(peer, outcomeChunk);
  if (!outcomeChunk.isForce && outcomeChunk.isBlocker) {
    peer.blockersChunks = peer.blockersChunks.filter((m) => m !== outcomeChunk);
    peer.emitter.emit('unblock', outcomeChunk);
    if (!peer.hasBlockers) peer.emitter.emit('unblockAll');
  }

  return result;
}
