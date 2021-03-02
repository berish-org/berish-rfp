import type { Peer } from '../peer';
import { fillChunk } from '../../chunk';
import { createRequest } from '../request';
import { SYMBOL_SERBER_PEER, SYMBOL_SERBER_REGISTRATOR } from '../../serber';
import type { PeerRequest } from '../receiveType';

export async function convertFromReceive<Data = any>(incomeRawRequest: PeerRequest<Peer, Data>) {
  const {
    peer,
    chunk: { body, aside, ...chunkMeta },
  } = incomeRawRequest;

  const preChunkBody = await peer.serberInstance.deserializeAsync(body, {
    [SYMBOL_SERBER_PEER]: peer,
    [SYMBOL_SERBER_REGISTRATOR]: null,
  });
  const preChunkAside = await peer.serberInstance.deserializeAsync(aside, {
    [SYMBOL_SERBER_PEER]: peer,
    [SYMBOL_SERBER_REGISTRATOR]: null,
  });
  const preChunkMeta = await peer.serberInstance.deserializeAsync(chunkMeta, {
    [SYMBOL_SERBER_PEER]: peer,
    [SYMBOL_SERBER_REGISTRATOR]: null,
  });

  return createRequest<Peer, Data>(peer, fillChunk({ body: preChunkBody, aside: preChunkAside, ...preChunkMeta }));
}
