import { RfpPeer } from './peer';
import { serberWithPlugins, SYMBOL_SERBER_PEER, SYMBOL_SERBER_REGISTRATOR } from '../serber';
import { IRfpChunk } from './types';

export function serberDeserialize<T = any>(peer: RfpPeer, incomeRawChunk: any) {
  const incomeChunk: IRfpChunk<T> = peer.serberInstance.deserialize(incomeRawChunk, {
    [SYMBOL_SERBER_PEER]: peer,
    [SYMBOL_SERBER_REGISTRATOR]: null,
  });
  return Object.freeze(incomeChunk);
}
