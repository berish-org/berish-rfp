import { getScope, StatefulObject } from '@berish/stateful';
import type { RfpPeer } from '..';
import { StoreChangedWhenConnectionError } from '../errors';
import { createPeerStateful } from './createPeerStateful';
import { disconnect } from './methods';

/**
 * PublicStore - передается между пирами по общему каналу, полная синхронизация.
 * PrivateStore - хранит данные в области конкретного пира
 * ProtectedStore - хранит данные в защищенной области, полная синхронизация
 */
export class PeerStore<
  PublicStore extends object = {},
  PrivateStore extends object = {},
  ProtectedStore extends object = {}
> {
  private _publicStore: StatefulObject<PublicStore> = null;
  private _privateStore: StatefulObject<PrivateStore> = null;
  private _protectedStore: StatefulObject<ProtectedStore> = null;
  private _isConnected: boolean = false;

  private _peer: RfpPeer = null;

  constructor(peer: RfpPeer) {
    this._peer = peer;
  }

  public get publicStore() {
    return this._publicStore;
  }

  public set publicStore(value: StatefulObject<PublicStore>) {
    if (this.isConnected) throw new StoreChangedWhenConnectionError();

    this._publicStore = createPeerStateful(this.peer, value, 'public');
  }

  public get privateStore() {
    return this._privateStore;
  }

  public set privateStore(value: StatefulObject<PrivateStore>) {
    if (this.isConnected) throw new StoreChangedWhenConnectionError();

    this._privateStore = createPeerStateful(this.peer, value, 'private');
  }

  public get protectedStore() {
    return this._protectedStore;
  }

  public set protectedStore(value: StatefulObject<ProtectedStore>) {
    if (this.isConnected) throw new StoreChangedWhenConnectionError();

    this._protectedStore = createPeerStateful(this.peer, value, 'protected');
  }

  public get peer() {
    return this._peer;
  }

  public get isConnected() {
    return this._isConnected;
  }

  public async connect() {
    await Promise.all(
      [this.publicStore, this.privateStore, this.protectedStore]
        .filter(Boolean)
        .map(async (store: StatefulObject<object>) => {
          const scope = getScope(store);

          if (scope.isConnected) scope.disconnect();
          await scope.connect();
        }),
    );
    this._isConnected = true;
  }

  public disconnect() {
    [this.publicStore, this.privateStore, this.protectedStore].filter(Boolean).map((store: StatefulObject<object>) => {
      const scope = getScope(store);
      scope.disconnect();
    });
    this._isConnected = false;
  }
}
