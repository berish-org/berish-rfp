import type { Peer } from '../peer';
import { fillChunk } from '../../chunk';
import {
  SYMBOL_SERBER_PEER,
  SYMBOL_SERBER_REGISTRATOR,
  SYMBOL_SERBER_DEFERRED_LIST,
  SYMBOL_SERBER_CHUNK_REPLY_PATH,
  DeferredReceiveList,
} from '../../serber';
import { SYMBOL_SERBER_REQUEST } from '../../serber/peerDecoratorToResultPlugin';

import { createRequest } from '../request';
import { PeerRequest } from '../receiveType';

export async function convertToSend<Data = any>(
  outcomeRequest: PeerRequest<Peer, Data>,
  deferredList: DeferredReceiveList,
  incomeRequest?: PeerRequest<Peer, any>,
) {
  const {
    peer,
    chunk: { body, aside, ...chunkMeta },
  } = outcomeRequest;

  const replyPath = incomeRequest && incomeRequest.chunk && incomeRequest.chunk.path;

  const preChunkBody = await peer.serberInstance.serializeAsync(body, {
    [SYMBOL_SERBER_PEER]: peer,
    [SYMBOL_SERBER_DEFERRED_LIST]: deferredList,
    [SYMBOL_SERBER_REGISTRATOR]: null,
    [SYMBOL_SERBER_CHUNK_REPLY_PATH]: replyPath,
    [SYMBOL_SERBER_REQUEST]: incomeRequest,
  });
  const preChunkAside = await peer.serberInstance.serializeAsync(aside, {
    [SYMBOL_SERBER_PEER]: peer,
    [SYMBOL_SERBER_DEFERRED_LIST]: deferredList,
    [SYMBOL_SERBER_REGISTRATOR]: null,
    [SYMBOL_SERBER_CHUNK_REPLY_PATH]: replyPath,
    [SYMBOL_SERBER_REQUEST]: incomeRequest,
  });
  const preChunkMeta = await peer.serberInstance.serializeAsync(chunkMeta, {
    [SYMBOL_SERBER_PEER]: peer,
    [SYMBOL_SERBER_DEFERRED_LIST]: deferredList,
    [SYMBOL_SERBER_REGISTRATOR]: null,
    [SYMBOL_SERBER_CHUNK_REPLY_PATH]: replyPath,
    [SYMBOL_SERBER_REQUEST]: incomeRequest,
  });
  return createRequest<Peer, Data>(peer, fillChunk({ body: preChunkBody, aside: preChunkAside, ...preChunkMeta }));
}
