import type { Peer, PeerRequest } from '../../peer';
import type { PeerChunk } from '../../chunk';

export function createRequest<TPeer extends Peer = Peer, Data extends any = any>(
  peer: TPeer,
  chunk: PeerChunk<Data>,
): Readonly<PeerRequest<TPeer, Data>> {
  return Object.freeze({ peer, chunk });
}
