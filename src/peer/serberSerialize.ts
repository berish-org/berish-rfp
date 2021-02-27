import { RfpPeer } from './peer';
import {
  serberWithPlugins,
  SYMBOL_SERBER_PEER,
  SYMBOL_SERBER_REGISTRATOR,
  SYMBOL_SERBER_DEFERRED_LIST,
  SYMBOL_SERBER_CHUNK_REPLY_PATH,
  DeferredReceiveList,
} from '../serber';
import { PeerRequest } from './methods';
import type { PeerChunk } from '../chunk';
import { SYMBOL_SERBER_REQUEST } from '../serber/peerDecoratorToResultPlugin';

export function serberSerialize(
  request: PeerRequest<RfpPeer, any>,
  deferredList: DeferredReceiveList,
  replyPath?: string,
) {
  const {
    peer,
    chunk: { body, aside, ...chunkMeta },
  } = request;

  const preChunkBody = peer.serberInstance.serialize(body, {
    [SYMBOL_SERBER_PEER]: peer,
    [SYMBOL_SERBER_DEFERRED_LIST]: deferredList,
    [SYMBOL_SERBER_REGISTRATOR]: null,
    [SYMBOL_SERBER_CHUNK_REPLY_PATH]: replyPath,
    [SYMBOL_SERBER_REQUEST]: request,
  });
  const preChunkAside = peer.serberInstance.serialize(aside, {
    [SYMBOL_SERBER_PEER]: peer,
    [SYMBOL_SERBER_DEFERRED_LIST]: deferredList,
    [SYMBOL_SERBER_REGISTRATOR]: null,
    [SYMBOL_SERBER_CHUNK_REPLY_PATH]: replyPath,
    [SYMBOL_SERBER_REQUEST]: request,
  });
  const preChunkMeta = peer.serberInstance.serialize(chunkMeta, {
    [SYMBOL_SERBER_PEER]: peer,
    [SYMBOL_SERBER_DEFERRED_LIST]: deferredList,
    [SYMBOL_SERBER_REGISTRATOR]: null,
    [SYMBOL_SERBER_CHUNK_REPLY_PATH]: replyPath,
    [SYMBOL_SERBER_REQUEST]: request,
  });
  return { body: preChunkBody, aside: preChunkAside, ...preChunkMeta } as PeerChunk<any>;
}
