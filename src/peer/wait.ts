import { IRfpChunk, FromRFP } from './types';
import { RfpPeer } from './peer';
import { SYMBOL_NO_RESPONSE } from '../constants';
import { listen } from './listen';

export function wait<Resolve = any, Chunk extends IRfpChunk<any> = IRfpChunk<any>>(peer: RfpPeer, chunk: Chunk) {
  return new Promise<IRfpChunk<FromRFP<Resolve>> & { replyChunk: Chunk }>((resolve, reject) => {
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
