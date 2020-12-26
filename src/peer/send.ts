import guid from 'berish-guid';
import { RfpPeer } from './peer';
import { IRfpChunk } from './types';
import { IDeferredList, deferredReceiveStart } from '..';
import { serberSerialize } from './serberSerialize';
import { waitUnblockAll } from './waitUnblockAll';
import { wait } from './wait';

export async function send<Resolve = any, Data = any>(
  peer: RfpPeer,
  outcomeChunk: IRfpChunk<Data>,
  replyPath?: string,
) {
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

  const deferredList: IDeferredList = {};
  const outcomeRawChunk = serberSerialize(peer, outcomeChunk, deferredList, replyPath);
  deferredReceiveStart(deferredList);

  peer.transport.send(peer, outcomeRawChunk);
  peer.getLogger()('peer')('send').info(outcomeRawChunk);

  if (outcomeChunk.notWaiting) {
    peer.getLogger()('peer')('send')('notWait').info(outcomeRawChunk.chunkId);
    return void 0;
  }

  peer.getLogger()('peer')('send')('wait').info(outcomeRawChunk);

  const result = await wait<Resolve, IRfpChunk<Data>>(peer, outcomeChunk);
  if (!outcomeChunk.isForce && outcomeChunk.isBlocker) {
    peer.blockersChunks = peer.blockersChunks.filter((m) => m !== outcomeChunk);
    peer.emitter.emit('unblock', outcomeChunk);
    if (!peer.hasBlockers) peer.emitter.emit('unblockAll');
  }

  return result;
}
