import type { Peer } from '../peer';
import { fillChunk } from '../../chunk';
import { DeferredReceiveList } from '../../serber';

import { createRequest } from '../request';
import { PeerRequest } from '../receiveType';
import { convertDataToSend } from './convertDataToSend';

export async function convertToSend<Data = any>(
  outcomeRequest: PeerRequest<Peer, Data>,
  deferredList: DeferredReceiveList,
  incomeRequest?: PeerRequest<Peer, any>,
) {
  const {
    peer,
    chunk: { body, aside, ...chunkMeta },
  } = outcomeRequest;

  const preChunkBody = await convertDataToSend(peer, body, deferredList, incomeRequest);
  const preChunkAside = await convertDataToSend(peer, aside, deferredList, incomeRequest);
  const preChunkMeta = await convertDataToSend(peer, chunkMeta, deferredList, incomeRequest);

  return createRequest<Peer, Data>(peer, fillChunk({ body: preChunkBody, aside: preChunkAside, ...preChunkMeta }));
}
