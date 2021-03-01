import { StatefulObject, getScope } from '@berish/stateful';
import { ServiceChannel } from '../modules';

import type { PeerTransport } from '../transport';

import type { PeerLogger } from '../logger';
import { getConsoleLogger } from '../logger';

import type { PeerEmitter } from '../emitter';
import { getEmitter } from '../emitter';

import { InternalPluginsType, internalPlugins, serberWithPlugins } from '../serber';
import { RfpReceive } from './types';
import type { PeerChunk } from '../chunk';
import { SYMBOL_MIDDLEWARE_LISTENERS } from '../constants';
import { middleware } from './middleware';
import { listen } from './listen';
import { connect } from './connect';
import { disconnect } from './disconnect';
import { send } from './send';
import { createRequest } from './methods';
import { PeerStore } from '../store/store';

export class RfpPeer<
  TPeerStore extends PeerStore<{}, {}, {}> = PeerStore<{}, {}, {}>,
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
  private _blockersChunks: PeerChunk<any>[] = null;
  private _debugLog: string = null;

  private _serberInstance: typeof serberWithPlugins = null;
  private _store: TPeerStore = new PeerStore(this) as TPeerStore;

  private _serviceChannel: ServiceChannel = null;
  private _emitter: PeerEmitter = getEmitter();
  private _logger: PeerLogger = getConsoleLogger();

  public get logger() {
    return this._logger;
  }

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

  public set blockersChunks(value: PeerChunk<any>[]) {
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

  public get store() {
    return this._store;
  }

  public get emitter() {
    return this._emitter;
  }

  public get serviceChannel() {
    if (!this._serviceChannel) this._serviceChannel = ServiceChannel.getServiceChannel('main').setPeer(this);
    return this._serviceChannel;
  }

  public setLogger(logger: PeerLogger) {
    // TODO
    // проверка, что это логгер
    this._logger = logger;

    return this;
  }

  public setTransport<TPeerTransport extends PeerTransport<any>>(transport: TPeerTransport) {
    this._transport = transport as any;
    return (this as any) as RfpPeer<TPeerStore, TPeerTransport>;
  }

  public async connect() {
    const newUnsubscribeId = await connect(this, this._transportUnsubscribeId);
    this._transportUnsubscribeId = newUnsubscribeId;
  }

  public disconnect() {
    disconnect(this, this._transportUnsubscribeId);
    this._transportUnsubscribeId = null;
  }

  public setStore<TStore extends PeerStore = PeerStore>(store: TStore) {
    this._store = store as any;

    return (this as any) as RfpPeer<TStore, TransportType>;
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

  public async send<Resolve = any, Data = any>(outcomeChunk: PeerChunk<Data>) {
    const request = createRequest(this, outcomeChunk);

    return send<Resolve, Data>(request);
  }
}
