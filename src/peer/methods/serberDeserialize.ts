import type { Peer } from '../peer';
import type { PeerChunk } from '../../chunk';
import type { PeerRequest } from './createRequest';
import { SYMBOL_SERBER_PEER, SYMBOL_SERBER_REGISTRATOR } from '../../serber';

export function serberDeserialize<T = any>(incomeRawRequest: PeerRequest<Peer, any>) {
  const { peer, chunk } = incomeRawRequest;

  const incomeChunk: PeerChunk<T> = peer.serberInstance.deserialize(chunk, {
    [SYMBOL_SERBER_PEER]: peer,
    [SYMBOL_SERBER_REGISTRATOR]: null,
  });

  return incomeChunk;
}
