import { Peer } from '../peer';

export function unreceiveAll(peer: Peer) {
  peer.receiveEmitter.offAll();
}
