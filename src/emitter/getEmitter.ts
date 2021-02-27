import { EventEmitter } from '@berish/emitter';

import { PeerChunk } from '../chunk';

export interface PeerEmitterEventMap {
  connected: never;
  disconnected: never;
  block: PeerChunk<any>;
  unblock: PeerChunk<any>;
  unblockAll: never;
}

export type PeerEmitter = EventEmitter<PeerEmitterEventMap>;

export function getEmitter(): PeerEmitter {
  return new EventEmitter<PeerEmitterEventMap>();
}
