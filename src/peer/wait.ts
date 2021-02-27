import { FromRFP } from './types';
import type { PeerChunk } from '../chunk';
import { RfpPeer } from './peer';
import { SYMBOL_NO_RESPONSE } from '../constants';
import { listen } from './listen';

export function wait<Resolve = any, Chunk extends PeerChunk<any> = PeerChunk<any>>(peer: RfpPeer, chunk: Chunk) {
  return new Promise<PeerChunk<FromRFP<Resolve>> & { replyChunk: Chunk }>((resolve, reject) => {
    const tempUnreceive = listen(peer, chunk.chunkId, ({ chunk: replyChunk }) => {
      if (replyChunk.status === 'reject' || replyChunk.status === 'resolve') {
        if (tempUnreceive) tempUnreceive();
        if (replyChunk.status === 'reject') reject(replyChunk.body);
        else resolve({ ...replyChunk, body: replyChunk.body, replyChunk: chunk });
      }
      return SYMBOL_NO_RESPONSE;
    });
  });
}
