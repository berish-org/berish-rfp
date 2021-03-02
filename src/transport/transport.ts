import { EventEmitter } from '@berish/emitter';
import { TransportNotSupportedSendError } from '../errors';

import type { TransportPlugin } from './transportPlugin';
import type { Peer } from '../peer';
import type { PeerChunk } from '../chunk';
import { cborBinaryEncoder, jsonStringEncoder } from './transportEncoders';

export interface PeerTransportAdapter<T = any> {
  transport?: T;

  send?(data: any): void;
  subscribe?(cb: (data: any) => any): () => void;

  binaryFormat: 'string' | 'binary';
  binaryEncoder?: PeerTransportBinaryEncoder;
  stringEncoder?: PeerTransportStringEncoder;
}

export interface PeerTransportBinaryEncoder {
  encode: (data: any) => Buffer | Promise<Buffer>;
  decode: (data: Buffer) => any;
}

export interface PeerTransportStringEncoder {
  encode: (data: Buffer) => string | Promise<string>;
  decode: (data: string) => Buffer | Promise<Buffer>;
}

export interface PeerTransportEventEmitterMap {
  subscribe: any;
}

export class PeerTransport<Adapter extends PeerTransportAdapter<any> = PeerTransportAdapter<any>> {
  private _transportAdapter: Adapter = null;
  private _plugins: TransportPlugin[] = null;
  private _emitter: EventEmitter<PeerTransportEventEmitterMap> = null;
  private _isConnected: boolean = false;

  constructor(transportAdapter: Adapter, plugins?: TransportPlugin[]) {
    if (!transportAdapter) throw new TypeError('Peer transport adapter is null');

    this._transportAdapter = transportAdapter;
    this._plugins = plugins || [];
    this._emitter = new EventEmitter();
  }

  public get transportAdapter() {
    return this._transportAdapter;
  }

  public get binaryEncoder() {
    return this.transportAdapter.binaryEncoder || cborBinaryEncoder;
  }

  public get stringEncoder() {
    return this.transportAdapter.stringEncoder || jsonStringEncoder;
  }

  public get plugins() {
    return this._plugins || [];
  }

  public async send(peer: Peer, data: PeerChunk<any>) {
    if (!this.transportAdapter.send) throw new TypeError('Transport adapter send is null');

    try {
      const beforeSend = await this._beforeSend(peer, data);
      await this.transportAdapter.send(beforeSend);
      return true;
    } catch (err) {
      // IGNORE
      return false;
    }
  }

  public subscribe(peer: Peer, callback: (data: PeerChunk<any>) => void) {
    return this._emitter.cacheSubscribe<any>(
      'subscribe',
      (callback) => this.transportAdapter.subscribe(callback),
      async (data) => {
        try {
          const __beforeResponse = await this._beforeResponse(peer, data);
          callback(__beforeResponse);
        } catch (err) {
          // Ошибка на транспортном уровне
          // IGNORE
        }
      },
    );
  }

  public unsubscribe(eventHash: string) {
    return this._emitter.off(eventHash);
  }

  private async _beforeSend(peer: Peer, data: PeerChunk<any>) {
    const beforeDataSend = data && (await this._beforeDataSend(peer, data));
    const binaryEncodeData = beforeDataSend && (await this.binaryEncoder.encode(beforeDataSend));
    const beforeTransportSend = binaryEncodeData && (await this._beforeTransportSend(peer, binaryEncodeData));
    const binaryData =
      this.transportAdapter.binaryFormat === 'string'
        ? await this.stringEncoder.encode(beforeTransportSend)
        : beforeTransportSend;

    return binaryData;
  }

  private async _beforeResponse(peer: Peer, data: string | Buffer): Promise<PeerChunk<any>> {
    const binaryData =
      this.transportAdapter.binaryFormat === 'string'
        ? await this.stringEncoder.decode(data as string)
        : (data as Buffer);
    const beforeTransportResponse = binaryData && (await this._beforeTransportResponse(peer, binaryData));
    const binaryDecodeData = beforeTransportResponse && (await this.binaryEncoder.decode(beforeTransportResponse));
    const beforeDataResponse = binaryDecodeData && (await this._beforeDataResponse(peer, binaryDecodeData));

    return beforeDataResponse;
  }

  private _beforeDataSend(peer: Peer, chunk: PeerChunk<any>) {
    return this.plugins.reduce(async (chunkPromise, plugin) => {
      const chunk = await chunkPromise;
      const data = (plugin && plugin.beforeDataSend && (await plugin.beforeDataSend(peer, chunk))) || chunk;
      return data;
    }, Promise.resolve(chunk));
  }

  private _beforeTransportSend(peer: Peer, binaryData: Buffer) {
    return this.plugins.reduce(async (binaryDataPromise, plugin) => {
      const binaryData = await binaryDataPromise;
      const data =
        (plugin && plugin.beforeTransportSend && (await plugin.beforeTransportSend(peer, binaryData))) || binaryData;
      return data;
    }, Promise.resolve(binaryData));
  }

  private _beforeDataResponse(peer: Peer, chunk: PeerChunk<any>) {
    return this.plugins.reduceRight(async (chunkPromise, plugin) => {
      const chunk = await chunkPromise;
      const data = (plugin && plugin.beforeDataResponse && (await plugin.beforeDataResponse(peer, chunk))) || chunk;
      return data;
    }, Promise.resolve(chunk));
  }

  private _beforeTransportResponse(peer: Peer, binaryData: Buffer) {
    return this.plugins.reduceRight(async (binaryDataPromise, plugin) => {
      const binaryData = await binaryDataPromise;
      const data =
        (plugin && plugin.beforeTransportResponse && (await plugin.beforeTransportResponse(peer, binaryData))) ||
        binaryData;
      return data;
    }, Promise.resolve(binaryData));
  }
}
