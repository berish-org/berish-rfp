import { EventEmitter } from '@berish/emitter';

import type { PeerNextResponse, PeerRequest } from '../peer';

export interface PeerReceiveEmitterEventMap {
  [receiveName: string]: {
    request: PeerRequest;
    next: PeerNextResponse;
  };
}

export type PeerReceiveEmitter = EventEmitter<PeerReceiveEmitterEventMap>;

export function getReceiveEmitter(): PeerReceiveEmitter {
  return new EventEmitter();
}
