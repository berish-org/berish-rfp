import { ServiceChannel } from '../serviceChannel';
import { PeerTransport, PeerConnection } from '../transport';

import type { PeerLogger } from '../logger';
import { getConsoleLogger } from '../logger';

import type { PeerEmitter, PeerReceiveEmitter } from '../emitter';
import { getEmitter, getReceiveEmitter } from '../emitter';

import { InternalPluginsType, internalPlugins, serberWithPlugins } from '../serber';
import type { PeerChunk } from '../chunk';
import { createRequest } from './request';
import { PeerReceive } from './receiveType';
import { connect, disconnect } from './connection';
import { ConnectionError } from '../errors';
import { receive, unreceive, unreceiveAll } from './emit';
import { sendInitial } from './send';
import { SYMBOL_PEER_SCOPE } from '../const';
import { PeerScope } from './peerScope';

export interface PeerParams {
  name?: string;
  logger?: PeerLogger;
}
export class Peer {
  public [SYMBOL_PEER_SCOPE] = new PeerScope(this);

  private _params: PeerParams = null;
  private _logger: PeerLogger = null;

  private _connection: PeerConnection<any> = null;
  private _serberInstance: typeof serberWithPlugins = null;

  private _serviceChannel: ServiceChannel = new ServiceChannel(this);
  private _receiveEmitter: PeerReceiveEmitter = getReceiveEmitter();
  private _emitter: PeerEmitter = getEmitter();

  constructor(params?: PeerParams) {
    const { logger, name } = params || {};

    this._params = params || {};
    this._logger = logger || getConsoleLogger(name);
  }

  public get params() {
    return this._params;
  }

  public get logger() {
    return this._logger;
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

  public async start(transport: PeerTransport<any>) {
    try {
      this.emitter.removeState('disconnect.start');
      this.emitter.removeState('disconnect.finish');
      await this.stop();

      this.logger.info('connect.start');
      await this.emitter.emitStateAsync('connect.start', null);

      this.connection = PeerConnection.create(transport, this);
      this.connection.transportConnect();

      this.emitter.removeState('transport.disconnected');
      await this.emitter.emitStateAsync('transport.connected', null);

      await connect(this);

      await this.emitter.emitStateAsync('connect.finish', null);
      this.logger.info('connect.finish');
    } catch (err) {
      await this.emitter.emitAsync('error', err);
    }
  }

  public async stop() {
    try {
      if (this.connection) {
        this.emitter.removeState('connect.start');
        this.emitter.removeState('connect.finish');

        this.logger.info('disconnect.start');
        await this.emitter.emitStateAsync('disconnect.start', null);

        await this[SYMBOL_PEER_SCOPE].clear().catch();

        this.connection.transportDisconnect();
        this.connection = null;

        this.emitter.removeState('transport.connected');
        await this.emitter.emitStateAsync('transport.disconnected', null);

        await disconnect(this);

        await this.emitter.emitStateAsync('disconnect.finish', null);
        this.logger.info('disconnect.finish');
      }
    } catch (err) {
      this.connection = null;
      await this.emitter.emitAsync('error', err);
    }
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
    if (!this.connection) throw new ConnectionError('Peer is disconnected');

    return sendInitial<Resolve, Data>(this, outcomeChunk);
  }
}
