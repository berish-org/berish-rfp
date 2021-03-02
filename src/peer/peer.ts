import { ServiceChannel } from '../modules';
import type { PeerTransport } from '../transport';

import type { PeerLogger } from '../logger';
import { getConsoleLogger } from '../logger';

import type { PeerEmitter, PeerReceiveEmitter } from '../emitter';
import { getEmitter, getReceiveEmitter } from '../emitter';

import { InternalPluginsType, internalPlugins, serberWithPlugins } from '../serber';
import { receive, sendInitial, unreceive, unreceiveAll } from './methods';
import type { PeerChunk } from '../chunk';
import { createRequest } from './methods';
import { PeerReceive } from './receiveType';
import { ConnectionError } from '../errors';
import { PeerConnection } from '../connection';

export interface PeerParams {
  name?: string;
  logger?: PeerLogger;
}
export class Peer {
  private _logger: PeerLogger = null;

  private _connection: PeerConnection<any> = null;
  private _blockersChunks: PeerChunk<any>[] = null;
  private _serberInstance: typeof serberWithPlugins = null;

  private _serviceChannel: ServiceChannel = new ServiceChannel(this);
  private _receiveEmitter: PeerReceiveEmitter = getReceiveEmitter();
  private _emitter: PeerEmitter = getEmitter();

  constructor(params?: PeerParams) {
    const { logger, name } = params || {};

    this._logger = logger || getConsoleLogger(name);
  }

  public get logger() {
    return this._logger;
  }

  public get blockersChunks() {
    if (!this._blockersChunks) this._blockersChunks = [];

    return this._blockersChunks;
  }

  public set blockersChunks(value: PeerChunk<any>[]) {
    this._blockersChunks = value || [];
  }

  public get hasBlockers() {
    return this.blockersChunks.length > 0;
  }

  public get serberInstance() {
    if (!this._serberInstance) this._serberInstance = serberWithPlugins;
    return this._serberInstance;
  }

  public get receiveEmitter() {
    return this._receiveEmitter;
  }

  public get emitter() {
    return this._emitter;
  }

  public get serviceChannel() {
    return this._serviceChannel;
  }

  public get connection() {
    return this._connection;
  }

  public set connection(value: PeerConnection<any>) {
    this._connection = value;
  }

  public setLogger(logger: PeerLogger) {
    // TODO
    // проверка, что это логгер
    this._logger = logger;

    return this;
  }

  public async connect(transport: PeerTransport<any>) {
    await PeerConnection.connect(this, transport);
  }

  public async disconnect() {
    await PeerConnection.disconnect(this);
  }

  public setSerber(callback: (internalPlugins: InternalPluginsType) => typeof serberWithPlugins) {
    const serber = callback(internalPlugins);
    if (serber) this._serberInstance = serber;
    return this;
  }

  public receive<Data = any>(path: string, listener: PeerReceive<this, Data>): string {
    return receive(this, path, listener);
  }

  public unreceive(receiveHash: string): void {
    return unreceive(this, receiveHash);
  }

  public unreceiveAll() {
    return unreceiveAll(this);
  }

  public async send<Resolve = any, Data = any>(outcomeChunk: PeerChunk<Data>) {
    return sendInitial<Resolve, Data>(createRequest(this, outcomeChunk));
  }
}
