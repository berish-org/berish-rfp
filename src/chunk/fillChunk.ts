import guid from 'berish-guid';

import type { PeerChunk } from './peerChunkType';

export function fillChunk<Data = any>(outcomeChunk: PeerChunk<Data>) {
  outcomeChunk.chunkId = outcomeChunk.chunkId || guid.guid();
  outcomeChunk.aside = outcomeChunk.aside || {};
  outcomeChunk.status = outcomeChunk.status || 'initial';
  outcomeChunk.notWaiting = !!outcomeChunk.notWaiting;
  outcomeChunk.isBlocker = !!outcomeChunk.isBlocker;
  outcomeChunk.isForce = !!outcomeChunk.isForce;

  return outcomeChunk;
}
