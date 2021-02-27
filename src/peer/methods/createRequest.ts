import type { RfpPeer } from '../../peer';
import type { PeerChunk } from '../../chunk';

export interface PeerRequest<TPeer extends RfpPeer = RfpPeer, Data extends any = any> {
  chunk: PeerChunk<Data>;
  peer: TPeer;
}

export function createRequest<TPeer extends RfpPeer = RfpPeer, Data extends any = any>(
  peer: TPeer,
  chunk: PeerChunk<Data>,
): Readonly<PeerRequest<TPeer, Data>> {
  return Object.freeze({ peer, chunk });
}
