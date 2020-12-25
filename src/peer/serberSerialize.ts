import { RfpPeer } from './peer';
import {
  serberWithPlugins,
  SYMBOL_SERBER_PEER,
  SYMBOL_SERBER_REGISTRATOR,
  SYMBOL_SERBER_DEFERRED_LIST,
  SYMBOL_SERBER_CHUNK_REPLY_PATH,
  IDeferredList,
} from '../serber';
import { IRfpChunk } from './types';

export function serberSerialize(
  peer: RfpPeer,
  outcomeChunk: IRfpChunk<any>,
  deferredList: IDeferredList,
  replyPath?: string
) {
  const { body, aside, ...chunkMeta } = outcomeChunk;
  const preChunkBody = peer.serberInstance.serialize(body, {
    [SYMBOL_SERBER_PEER]: peer,
    [SYMBOL_SERBER_DEFERRED_LIST]: deferredList,
    [SYMBOL_SERBER_REGISTRATOR]: null,
    [SYMBOL_SERBER_CHUNK_REPLY_PATH]: replyPath,
  });
  const preChunkAside = peer.serberInstance.serialize(aside, {
    [SYMBOL_SERBER_PEER]: peer,
    [SYMBOL_SERBER_DEFERRED_LIST]: deferredList,
    [SYMBOL_SERBER_REGISTRATOR]: null,
    [SYMBOL_SERBER_CHUNK_REPLY_PATH]: replyPath,
  });
  const preChunkMeta = peer.serberInstance.serialize(chunkMeta, {
    [SYMBOL_SERBER_PEER]: peer,
    [SYMBOL_SERBER_DEFERRED_LIST]: deferredList,
    [SYMBOL_SERBER_REGISTRATOR]: null,
    [SYMBOL_SERBER_CHUNK_REPLY_PATH]: replyPath,
  });
  return { body: preChunkBody, aside: preChunkAside, ...preChunkMeta } as IRfpChunk<any>;
}
