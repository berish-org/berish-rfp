import type { Peer } from '../peer';

export function waitUnblockAll(peer: Peer) {
  peer.logger('peer')('waitUnblockAll').info(peer.blockersChunks);

  return new Promise<void>((resolve) => {
    let id = peer.emitter.on('unblockAll', () => {
      resolve();
      peer.emitter.off(id);
      id = null;
    });
  });
}
