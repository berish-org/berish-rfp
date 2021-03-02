import type { PeerNextResponse, Peer } from '../peer';
import type { PeerChunkBlockForce } from '../chunk';
import { PeerRequest, send } from '../peer/methods';
import { magicalDictionary } from '../constants';

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
  private _peer: Peer = null;

  constructor(peer: Peer) {
    if (!peer) throw new TypeError('PeerServiceChannel peer is null');

    this._peer = peer;
  }

  public get peer() {
    return this._peer;
  }

  public async send<InputData, OutputData>(
    moduleName: string,
    commandName: string,
    data?: InputData,
    options?: PeerChunkBlockForce,
    force?: boolean,
  ) {
    options = options || {};

    const commandData: IRfpServiceData<Partial<InputData>> = {
      moduleName,
      commandName,
      data,
    };
    const response = await send(
      this.peer,
      { path: magicalDictionary.serviceChannel, body: commandData, ...options },
      null,
      force,
    );

    const responseCommandData: IRfpServiceData<Partial<OutputData>> = {
      moduleName,
      commandName,
      data: response.body,
    };
    return responseCommandData;
  }

  public receive<InputData>(moduleName: string, commandName: string, listener: RfpServiceMiddlewareReceive<InputData>) {
    return this.peer.receive<IRfpServiceData<InputData>>(magicalDictionary.serviceChannel, ({ chunk, peer }, next) => {
      const { body } = chunk;
      if (!body.moduleName || !body.commandName) return next();
      if (body.moduleName !== moduleName) return next();
      if (body.commandName !== commandName) return next();

      return listener({ chunk, peer, serviceData: body.data }, next);
    });
  }

  public unreceive(receiveHash: string) {
    this.peer.unreceive(receiveHash);
  }
}
