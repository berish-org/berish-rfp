import { RfpPeer } from '../peer';
import { PeerReceive } from '../receiveType';

export function unreceive(peer: RfpPeer, eventHash: string) {
  peer.receiveEmitter.off(eventHash);
}
