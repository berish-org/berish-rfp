import { RfpReceive } from './types';
import { RfpPeer } from './peer';

export function listen<Data extends any = any>(peer: RfpPeer, path: string, listener: RfpReceive<any, any, any, Data>) {
  peer.listeners[path] = peer.listeners[path] || [];
  peer.listeners[path].push(listener);
  return () => {
    peer.listeners[path] = peer.listeners[path] || [];
    peer.listeners[path] = peer.listeners[path].filter(m => m !== listener);
    if (peer.listeners[path].length <= 0) delete peer.listeners[path];
  };
}
