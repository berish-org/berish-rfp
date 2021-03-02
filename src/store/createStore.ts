import { createStateful, getScope, StatefulObject } from '@berish/stateful';
import { RfpPeer } from '../peer';
import { ServiceChannel } from '../modules/serviceChannel';

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

export function createStore<T extends object>(peer: RfpPeer, store: StatefulObject<T>, storeType: PeerStoreType) {
  const scope = getScope(store);

  scope.peer = peer;
  scope.storeType = storeType;
  scope.logger = scope.peer.logger('store')(scope.storeType);
  scope.isConnected = false;

  scope.connect = () => connect(store);
  scope.disconnect = () => disconnect(store);
  scope.sync = () => sync(store);
  scope.reactionSetValueRemote = (callback) => reactionSetValueRemote(store, callback);
  scope.reactionSetStateRemote = (callback) => reactionSetStateRemote(store, callback);
  scope.setValueRemote = (props, value) => setValueRemote(store, props, value);
  scope.setStateRemote = (state) => setStateRemote(store, state);

  scope.peer = peer;
  scope.serviceChannel = ServiceChannel.getServiceChannel('store');
  scope.serviceChannel.setPeer(peer);

  return store;
}
