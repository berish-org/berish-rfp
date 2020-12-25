import * as cbor from 'cbor';
import { RfpPeer, IRfpChunk } from '../peer';
import { Emitter } from '../helpers';
import { isBuffer } from '../serber/bufferToBufferPrintPlugin/helper';

export interface ITransportAdapter<T> {
  transport?: T;
  send?(path: string, data: any): any;
  subscribe?(path: string, cb: (data: any) => any): () => void;
  supportBinary?: boolean;
}

export interface ITransportDataEncoder<Peer extends RfpPeer = RfpPeer> {
  encode?: (data: Buffer, peer: Peer) => Buffer | Promise<Buffer>;
  decode?: (data: Buffer, peer: Peer) => Buffer | Promise<Buffer>;
}

export interface ITransportEmitterObject {
  subscribe: any;
}

export class Transport<T> {
  private _adapter: ITransportAdapter<T> = null;
  private _transportName: string = null;
  private _emitter: Emitter<ITransportEmitterObject> = null;
  private _encoders: ITransportDataEncoder[] = [];
  private _unsubscriber: () => any = null;

  constructor(adapter: ITransportAdapter<T>, transportName: string) {
    this._adapter = adapter;
    this._transportName = transportName;
    this._emitter = new Emitter();
  }

  public get isSupportBinary() {
    return !!this._adapter.supportBinary;
  }

  addEncoder(encoder: ITransportDataEncoder) {
    this._encoders.push(encoder);
    return () => this.removeEncoder(encoder);
  }

  removeEncoder(encoder: ITransportDataEncoder) {
    this._encoders = this._encoders.filter((m) => m !== encoder);
  }

  async send(peer: RfpPeer, data: IRfpChunk<any>) {
    if (!this._adapter.send) throw new Error('Transport send is not supported');
    const binary = data && (await cbor.encodeAsync(data));
    const encodedBinary = binary && (await this.encode(peer, binary));
    const encodedResult = this.isSupportBinary ? encodedBinary : encodedBinary && this.binaryToString(encodedBinary);
    return this._adapter.send(this._transportName, encodedResult);
  }

  subscribe(peer: RfpPeer, cb: (data: any) => any) {
    const hasSubscribe = this._emitter.hasListeners('subscribe');
    const id = this._emitter.on('subscribe', cb);
    if (!hasSubscribe) this.transportSubscribe(peer);
    return id;
  }

  async emit(peer: RfpPeer, binaryEncrypted: Buffer | string) {
    const binaryEncryptedResult =
      typeof binaryEncrypted !== 'string' ? binaryEncrypted : binaryEncrypted && this.stringToBinary(binaryEncrypted);
    const binary = binaryEncrypted && (await this.decode(peer, binaryEncryptedResult));
    const normal = binary && cbor.decode(binary);
    this._emitter.emit('subscribe', normal);
  }

  unsubscribe(id: string) {
    this._emitter.off(id);
    const hasSubscribe = this._emitter.hasListeners('subscribe');
    if (!hasSubscribe) this.transportUnsubscribe(this._unsubscriber);
  }

  private transportSubscribe(peer: RfpPeer) {
    this._unsubscriber = this._adapter.subscribe(this._transportName, (data) => this.emit(peer, data));
  }

  private transportUnsubscribe(callback: () => void) {
    callback();
  }

  private encode(peer: RfpPeer, data: Buffer) {
    return this._encoders.reduce(async (prevPromise, current) => {
      const prev = await prevPromise;
      const encoded = current && current.encode && (await current.encode(Buffer.from(prev), peer));
      return isBuffer(encoded) ? encoded : prev;
    }, Promise.resolve(data));
  }

  private decode(peer: RfpPeer, data: Buffer) {
    return this._encoders.reduce(async (prevPromise, current) => {
      const prev = await prevPromise;
      const decoded = current && current.decode && (await current.decode(Buffer.from(prev), peer));
      return isBuffer(decoded) ? decoded : prev;
    }, Promise.resolve(data));
  }

  private binaryToString(buffer: Buffer) {
    const json = buffer && buffer.toJSON();
    return json && JSON.stringify(json.data);
    // return str && base64.encode(str);
  }

  private stringToBinary(str: string) {
    try {
      // const jsonStr = str && base64.decode(str);
      const json: number[] = str && JSON.parse(str);
      return json && Buffer.from(json);
    } catch (err) {
      return null;
    }
  }
}
