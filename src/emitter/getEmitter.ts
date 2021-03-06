import { EventEmitter } from '@berish/emitter';

import { PeerChunk } from '../chunk';

export interface PeerEmitterStateMap {
  'connect.start': void;
  'connect.finish': void;
  'disconnect.start': void;
  'disconnect.finish': void;
  'transport.connected': void;
  'transport.disconnected': void;
  error: any;
  // block: PeerChunk<any>;
  unblockAll: never;
}

export type PeerEmitter = EventEmitter<{}, PeerEmitterStateMap>;

export function getEmitter(): PeerEmitter {
  return new EventEmitter<{}, PeerEmitterStateMap>();
}
