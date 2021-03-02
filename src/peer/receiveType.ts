import type { PeerChunk } from '../chunk';
import type { Peer } from './peer';

export interface PeerRequest<TPeer extends Peer = Peer, TData extends any = any> {
  chunk: PeerChunk<TData>;
  peer: TPeer;
}

export type PeerNextResponse = () => void;

export interface PeerReceive<TPeer extends Peer = Peer, TData extends any = any> {
  (request: PeerRequest<TPeer, TData>, next: PeerNextResponse): any;
}
