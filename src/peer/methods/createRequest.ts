import type { IRfpChunk, RfpPeer } from '../../peer';

export interface PeerRequest<TPeer extends RfpPeer = RfpPeer, Data extends any = any> {
  chunk: IRfpChunk<Data>;
  peer: TPeer;
}

export function createRequest<TPeer extends RfpPeer = RfpPeer, Data extends any = any>(
  peer: TPeer,
  chunk: IRfpChunk<Data>,
): Readonly<PeerRequest<TPeer, Data>> {
  return Object.freeze({ peer, chunk });
}
