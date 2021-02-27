import { RfpPeer } from './peer';
import { SYMBOL_SERBER_PEER, SYMBOL_SERBER_REGISTRATOR } from '../serber';
import type { PeerChunk } from '../chunk';

export function serberDeserialize<T = any>(peer: RfpPeer, incomeRawChunk: any) {
  const incomeChunk: PeerChunk<T> = peer.serberInstance.deserialize(incomeRawChunk, {
    [SYMBOL_SERBER_PEER]: peer,
    [SYMBOL_SERBER_REGISTRATOR]: null,
  });
  return Object.freeze(incomeChunk);
}
