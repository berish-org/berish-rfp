import type { Peer } from '../peer';
import { fillChunk, PeerChunk } from '../../chunk';
import {
  SYMBOL_SERBER_PEER,
  SYMBOL_SERBER_REGISTRATOR,
  SYMBOL_SERBER_DEFERRED_LIST,
  SYMBOL_SERBER_CHUNK_REPLY_PATH,
  DeferredReceiveList,
} from '../../serber';
import { SYMBOL_SERBER_REQUEST } from '../../serber/peerDecoratorToResultPlugin';

import { PeerRequest } from './createRequest';

export function serberSerialize(
  outcomeRequest: PeerRequest<Peer, any>,
  deferredList: DeferredReceiveList,
  incomeRequest?: PeerRequest<Peer, any>,
) {
  const {
    peer,
    chunk: { body, aside, ...chunkMeta },
  } = outcomeRequest;

  const replyPath = incomeRequest && incomeRequest.chunk && incomeRequest.chunk.path;

  const preChunkBody = peer.serberInstance.serialize(body, {
    [SYMBOL_SERBER_PEER]: peer,
    [SYMBOL_SERBER_DEFERRED_LIST]: deferredList,
    [SYMBOL_SERBER_REGISTRATOR]: null,
    [SYMBOL_SERBER_CHUNK_REPLY_PATH]: replyPath,
    [SYMBOL_SERBER_REQUEST]: incomeRequest,
  });
  const preChunkAside = peer.serberInstance.serialize(aside, {
    [SYMBOL_SERBER_PEER]: peer,
    [SYMBOL_SERBER_DEFERRED_LIST]: deferredList,
    [SYMBOL_SERBER_REGISTRATOR]: null,
    [SYMBOL_SERBER_CHUNK_REPLY_PATH]: replyPath,
    [SYMBOL_SERBER_REQUEST]: incomeRequest,
  });
  const preChunkMeta = peer.serberInstance.serialize(chunkMeta, {
    [SYMBOL_SERBER_PEER]: peer,
    [SYMBOL_SERBER_DEFERRED_LIST]: deferredList,
    [SYMBOL_SERBER_REGISTRATOR]: null,
    [SYMBOL_SERBER_CHUNK_REPLY_PATH]: replyPath,
    [SYMBOL_SERBER_REQUEST]: incomeRequest,
  });
  return fillChunk({ body: preChunkBody, aside: preChunkAside, ...preChunkMeta });
}
