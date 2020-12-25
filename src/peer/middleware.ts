import { RfpReceive } from './types';
import { RfpPeer } from './peer';
import { SYMBOL_MIDDLEWARE_LISTENERS } from '../constants';

export function middleware(peer: RfpPeer, listener: RfpReceive) {
  peer.listeners[SYMBOL_MIDDLEWARE_LISTENERS].push(listener);
  return () => {
    peer.listeners[SYMBOL_MIDDLEWARE_LISTENERS] = peer.listeners[SYMBOL_MIDDLEWARE_LISTENERS].filter(
      m => m !== listener
    );
  };
}
