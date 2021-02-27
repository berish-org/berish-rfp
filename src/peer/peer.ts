import { StatefulObject, getScope } from '@berish/stateful';
import { createStore, ServiceChannel } from '../modules';
import { PeerTransport } from '../transport';
import { Emitter, getLogger } from '../helpers';
import { InternalPluginsType, internalPlugins, serberWithPlugins } from '../serber';
import { RfpReceive, IPeerEmitterObject, IRfpChunk } from './types';
import { SYMBOL_MIDDLEWARE_LISTENERS } from '../constants';
import { middleware } from './middleware';
import { listen } from './listen';
import { connect } from './connect';
import { disconnect } from './disconnect';
import { send } from './send';
import { createRequest } from './methods';

export class RfpPeer<
  PublicStore extends {} = {},
  PrivateStore extends {} = {},
  ProtectedStore extends {} = {},
  TransportType extends PeerTransport<any> = PeerTransport<any>
> {
  private _transport: TransportType = null;
  private _transportUnsubscribeId: string = null;

  private _listeners: {
    [path: string]: RfpReceive<RfpPeer>[];
    [SYMBOL_MIDDLEWARE_LISTENERS]: RfpReceive<RfpPeer>[];
  } = {
    [SYMBOL_MIDDLEWARE_LISTENERS]: [],
  };
  private _blockersChunks: IRfpChunk<any>[] = null;
  private _debugLog: string = null;

  private _serberInstance: typeof serberWithPlugins = null;

  private _publicStore: StatefulObject<PublicStore> = null;
  private _privateStore: StatefulObject<PrivateStore> = null;
  private _protectedStore: StatefulObject<ProtectedStore> = null;

  private _serviceChannel: ServiceChannel = null;
  private _emitter: Emitter<IPeerEmitterObject> = new Emitter();

  public get transport() {
    return this._transport;
  }

  public get isConnected() {
    return !!this._transportUnsubscribeId;
  }

  public get listeners() {
    return this._listeners;
  }

  public get blockersChunks() {
    if (!this._blockersChunks) this._blockersChunks = [];
    return this._blockersChunks;
  }

  public set blockersChunks(value: IRfpChunk<any>[]) {
    if (!value) this._blockersChunks = [];
    else this._blockersChunks = value;
  }

  public get hasBlockers() {
    return this.blockersChunks.length > 0;
  }

  public get serberInstance() {
    if (!this._serberInstance) this._serberInstance = serberWithPlugins;
    return this._serberInstance;
  }

  public get publicStore() {
    return this._publicStore;
  }

  public get privateStore() {
    return this._privateStore;
  }

  public get protectedStore() {
    return this._protectedStore;
  }

  public get emitter() {
    return this._emitter;
  }

  public get serviceChannel() {
    if (!this._serviceChannel) this._serviceChannel = ServiceChannel.getServiceChannel('main').setPeer(this);
    return this._serviceChannel;
  }

  public setTransport<TPeerTransport extends PeerTransport<any>>(transport: TPeerTransport) {
    this._transport = transport as any;
    return (this as any) as RfpPeer<PublicStore, PrivateStore, ProtectedStore, TPeerTransport>;
  }

  public async connect() {
    const newUnsubscribeId = await connect(this, this._transportUnsubscribeId);
    this._transportUnsubscribeId = newUnsubscribeId;
  }

  public disconnect() {
    disconnect(this, this._transportUnsubscribeId);
    this._transportUnsubscribeId = null;
  }

  public setPublicStore<Store extends {} = {}>(target: Store) {
    if (this._publicStore) getScope(this._publicStore).disconnect();
    this._publicStore = (createStore(this, target, 'public') as any) as StatefulObject<PublicStore>;
    return (this as any) as RfpPeer<Store, PrivateStore, ProtectedStore, TransportType>;
  }

  public setPrivateStore<Store extends {} = {}>(target: Store) {
    if (this._privateStore) getScope(this._privateStore).disconnect();
    this._privateStore = (createStore(this, target, 'private') as any) as StatefulObject<PrivateStore>;
    return (this as any) as RfpPeer<PublicStore, Store, ProtectedStore, TransportType>;
  }

  public setProtectedStore<Store extends {} = {}>(target: Store) {
    if (this._protectedStore) getScope(this._protectedStore).disconnect();
    this._protectedStore = (createStore(this, target, 'protected') as any) as StatefulObject<ProtectedStore>;
    return (this as any) as RfpPeer<PublicStore, PrivateStore, Store, TransportType>;
  }

  public setSerber(callback: (internalPlugins: InternalPluginsType) => typeof serberWithPlugins) {
    const serber = callback(internalPlugins);
    if (serber) this._serberInstance = serber;
    return this;
  }

  public setDebugLog(debugLog: string) {
    this._debugLog = debugLog;
    return this;
  }

  public middleware(listener: RfpReceive<this>) {
    return middleware(this, listener);
  }

  public listen<Data = any>(path: string, listener: RfpReceive<this, Data>) {
    return listen(this, path, listener);
  }

  public unlistenAll() {
    this._listeners = { [SYMBOL_MIDDLEWARE_LISTENERS]: [] };
    return this;
  }

  public async send<Resolve = any, Data = any>(outcomeChunk: IRfpChunk<Data>) {
    const request = createRequest(this, outcomeChunk);

    return send<Resolve, Data>(request);
  }

  public getLogger() {
    return getLogger(this._debugLog);
  }
}
