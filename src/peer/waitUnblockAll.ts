import { RfpPeer } from './peer';

export function waitUnblockAll(peer: RfpPeer) {
  peer.getLogger()('peer')('waitUnblockAll').info(peer.blockersChunks);
  return new Promise<void>((resolve) => {
    let id = peer.emitter.on('unblockAll', () => {
      resolve();
      peer.emitter.off(id);
      id = null;
    });
  });
}
