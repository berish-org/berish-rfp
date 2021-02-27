import { EventEmitter } from '@berish/emitter';
import { TransportAdapterEmptyError, TransportNameEmptyError, TransportNotSupportedSendError } from '../errors';

import type { TransportPlugin } from './transportPlugin';
import type { RfpPeer, IRfpChunk } from '../peer';
import { cborBinaryEncoder } from './cborBinaryEncoder';
import { jsonStringEncoder } from './jsonStringEncoder';

export interface PeerTransportAdapter<T = any> {
  transport?: T;

  send?(path: string, data: any): any;
  subscribe?(path: string, cb: (data: any) => any): () => void;

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
  private _transportName: string = null;
  private _plugins: TransportPlugin[] = null;
  private _emitter: EventEmitter<PeerTransportEventEmitterMap> = null;

  constructor(transportName: string, transportAdapter: Adapter, plugins?: TransportPlugin[]) {
    if (!transportName) throw new TransportNameEmptyError();
    if (!transportAdapter) throw new TransportAdapterEmptyError();

    this._transportName = transportName;
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

  public get transportName() {
    return this._transportName;
  }

  public get plugins() {
    return this._plugins || [];
  }

  public async send(peer: RfpPeer, data: IRfpChunk<any>) {
    if (!this.transportAdapter.send) throw new TransportNotSupportedSendError();

    const beforeSend = await this._beforeSend(peer, data);
    return this.transportAdapter.send(this.transportName, beforeSend);
  }

  public subscribe(peer: RfpPeer, callback: (data: IRfpChunk<any>) => void) {
    return this._emitter.cacheSubscribe<any>(
      'subscribe',
      (callback) => this.transportAdapter.subscribe(this._transportName, callback),
      (data) => this._beforeResponse(peer, data).then((chunk) => callback(chunk)),
    );
  }

  public unsubscribe(eventHash: string) {
    return this._emitter.off(eventHash);
  }

  private async _beforeSend(peer: RfpPeer, data: IRfpChunk<any>) {
    const beforeDataSend = data && (await this._beforeDataSend(peer, data));
    const binaryEncodeData = beforeDataSend && (await this.binaryEncoder.encode(beforeDataSend));
    const beforeTransportSend = binaryEncodeData && (await this._beforeTransportSend(peer, binaryEncodeData));
    const binaryData =
      this.transportAdapter.binaryFormat === 'string'
        ? await this.stringEncoder.encode(beforeTransportSend)
        : beforeTransportSend;

    return binaryData;
  }

  private async _beforeResponse(peer: RfpPeer, data: string | Buffer): Promise<IRfpChunk<any>> {
    const binaryData =
      this.transportAdapter.binaryFormat === 'string'
        ? await this.stringEncoder.decode(data as string)
        : (data as Buffer);
    const beforeTransportResponse = binaryData && (await this._beforeTransportResponse(peer, binaryData));
    const binaryDecodeData = beforeTransportResponse && (await this.binaryEncoder.decode(beforeTransportResponse));
    const beforeDataResponse = binaryDecodeData && (await this._beforeDataResponse(peer, binaryDecodeData));

    return beforeDataResponse;
  }

  private _beforeDataSend(peer: RfpPeer, chunk: IRfpChunk<any>) {
    return this.plugins.reduce(async (chunkPromise, plugin) => {
      const chunk = await chunkPromise;
      const data = (plugin && plugin.beforeDataSend && (await plugin.beforeDataSend(peer, chunk))) || chunk;
      return data;
    }, Promise.resolve(chunk));
  }

  private _beforeTransportSend(peer: RfpPeer, binaryData: Buffer) {
    return this.plugins.reduce(async (binaryDataPromise, plugin) => {
      const binaryData = await binaryDataPromise;
      const data =
        (plugin && plugin.beforeTransportSend && (await plugin.beforeTransportSend(peer, binaryData))) || binaryData;
      return data;
    }, Promise.resolve(binaryData));
  }

  private _beforeDataResponse(peer: RfpPeer, chunk: IRfpChunk<any>) {
    return this.plugins.reduceRight(async (chunkPromise, plugin) => {
      const chunk = await chunkPromise;
      const data = (plugin && plugin.beforeDataResponse && (await plugin.beforeDataResponse(peer, chunk))) || chunk;
      return data;
    }, Promise.resolve(chunk));
  }

  private _beforeTransportResponse(peer: RfpPeer, binaryData: Buffer) {
    return this.plugins.reduceRight(async (binaryDataPromise, plugin) => {
      const binaryData = await binaryDataPromise;
      const data =
        (plugin && plugin.beforeTransportResponse && (await plugin.beforeTransportResponse(peer, binaryData))) ||
        binaryData;
      return data;
    }, Promise.resolve(binaryData));
  }
}
