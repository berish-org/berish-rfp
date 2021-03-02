import { RfpPeer } from '../peer';

export function unreceiveAll(peer: RfpPeer) {
  peer.receiveEmitter.offAll();
}
