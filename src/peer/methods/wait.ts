import type { FromPeer } from '../fromPeerType';
import type { PeerChunk } from '../../chunk';
import { Peer } from '../peer';
import { SYMBOL_NO_RESPONSE } from '../../constants';
import { receive } from './receive';
import { PeerRequest } from '../receiveType';
import { unreceive } from './unreceive';

export function wait<Resolve = any, Chunk extends PeerChunk<any> = PeerChunk<any>>(peer: Peer, chunk: Chunk) {
  return new Promise<PeerChunk<FromPeer<Resolve>> & { replyChunk: Chunk }>((resolve, reject) => {
    const receiveHash = receive(peer, chunk.chunkId, ({ chunk: replyChunk }: PeerRequest) => {
      peer.unreceive(receiveHash);

      if (replyChunk.status === 'reject') return reject(replyChunk.body);
      if (replyChunk.status === 'resolve') return resolve({ ...replyChunk, body: replyChunk.body, replyChunk: chunk });
      return SYMBOL_NO_RESPONSE;
    });
  });
}
