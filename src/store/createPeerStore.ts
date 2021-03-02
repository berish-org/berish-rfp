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

  return store;
}
