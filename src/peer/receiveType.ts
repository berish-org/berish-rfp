import type { PeerChunk } from '../chunk';
import type { RfpPeer } from './peer';

export interface PeerRequest<TPeer extends RfpPeer = RfpPeer, TData extends any = any> {
  chunk: PeerChunk<TData>;
  peer: TPeer;
}

export type PeerNextResponse = () => void;

export interface PeerReceive<TPeer extends RfpPeer = RfpPeer, TData extends any = any> {
  (request: PeerRequest<TPeer, TData>, next: PeerNextResponse): any;
}
