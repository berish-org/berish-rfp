import { getScope, StatefulObject } from '@berish/stateful';
import type { Peer } from '../peer';

import {
  connect,
  disconnect,
  reactionSetStateRemote,
  reactionSetValueRemote,
  setStateRemote,
  setValueRemote,
  sync,
} from './methods';
import type { PeerStoreType } from './extension';

export function createPeerStore<T extends object>(
  peer: Peer,
  storeName: string,
  storeType: PeerStoreType,
  store: StatefulObject<T>,
) {
  if (!peer) throw new TypeError('createPeerStore peer is null');
  if (!storeName) throw new TypeError('createPeerStore storeName is null');
  if (!storeType) throw new TypeError('createPeerStore storeType is null');
  if (!store) throw new TypeError('createPeerStore store is null');

  const scope = getScope(store);

  scope.storeName = storeName;
  scope.peer = peer;
  scope.storeType = storeType;
  scope.logger = scope.peer.logger('store')(`${scope.storeName} ${scope.storeType}`);
  scope.isConnected = false;

  scope.connect = () => connect(store);
  scope.disconnect = () => disconnect(store);
  scope.sync = () => sync(store);
  scope.reactionSetValueRemote = (callback) => reactionSetValueRemote(store, callback);
  scope.reactionSetStateRemote = (callback) => reactionSetStateRemote(store, callback);
  scope.setValueRemote = (props, value) => setValueRemote(store, props, value);
  scope.setStateRemote = (state) => setStateRemote(store, state);

  scope.peer = peer;

  scope.peer.emitter.on('connect.start', () => scope.connect());
  scope.peer.emitter.on('connect.finish', () => scope.sync());
  scope.peer.emitter.on('disconnect.start', () => scope.disconnect());

  return store;
}
