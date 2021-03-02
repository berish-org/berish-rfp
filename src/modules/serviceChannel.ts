import type { PeerNextResponse, Peer } from '../peer';
import type { PeerChunkBlockForce } from '../chunk';
import { PeerRequest } from '../peer/methods';
import { magicalDictionary } from '../constants';
import { ServiceChannelNameEmptyError } from '../errors';

export interface IRfpServiceData<T> {
  moduleName: string;
  commandName: string;
  data?: T;
}

export interface IRfpServiceRequest<T> extends PeerRequest {
  serviceData?: T;
}

export type RfpServiceMiddlewareReceive<StoreState = any> = (
  request: IRfpServiceRequest<StoreState>,
  next: PeerNextResponse,
) => any;

export class ServiceChannel {
  private constructor() {}

  public static getServiceChannel(moduleName: string) {
    return new ServiceChannel().moduleName(moduleName);
  }

  private _peer: Peer = null;
  private _moduleName: string = null;

  public setPeer(peer: Peer) {
    this._peer = peer;
    return this;
  }

  public get peer() {
    return this._peer;
  }

  public moduleName(): string;
  public moduleName(moduleName: string): ServiceChannel;
  public moduleName(moduleName?: string): string | ServiceChannel {
    if (typeof moduleName === 'undefined') return this._moduleName;
    this._moduleName = moduleName;
    return this;
  }

  public async send<InputData, OutputData>(commandName: string, data?: InputData, options?: PeerChunkBlockForce) {
    options = options || {};
    const commandData: IRfpServiceData<Partial<InputData>> = {
      commandName,
      data,
      moduleName: this._moduleName,
    };
    const response = await this.peer.send({ path: magicalDictionary.serviceChannel, body: commandData, ...options });
    const responseCommandData: IRfpServiceData<Partial<OutputData>> = {
      commandName,
      data: response.body,
      moduleName: this._moduleName,
    };
    return responseCommandData;
  }

  public receive<InputData>(commandName: string, listener: RfpServiceMiddlewareReceive<InputData>) {
    return this.peer.receive<any>(magicalDictionary.serviceChannel, ({ chunk, peer }, next) => {
      const responseCommand: IRfpServiceData<InputData> = chunk.body;
      if (!responseCommand.moduleName || !responseCommand.commandName) throw new ServiceChannelNameEmptyError();
      if (responseCommand.moduleName !== this._moduleName) return next();
      if (responseCommand.commandName !== commandName) return next();
      return listener({ chunk, peer, serviceData: responseCommand.data }, next);
    });
  }

  public unreceive(receiveHash: string) {
    this.peer.unreceive(receiveHash);
  }
}
