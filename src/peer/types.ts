import type { PeerChunk } from '../chunk';
import { PeerDecorator, IFunctionPrint } from '../serber';
import { PeerRequest } from './methods';
import { RfpPeer } from './peer';

type FromRFPInternal<T> = T extends PeerDecorator<infer WithoutRFP>
  ? WithoutRFP extends PromiseLike<infer WithoutPromise>
    ? WithoutPromise extends PeerDecorator<infer U>
      ? U
      : WithoutPromise
    : WithoutRFP extends PeerDecorator<infer U>
    ? U
    : WithoutRFP
  : T extends PromiseLike<infer WithoutPromise>
  ? WithoutPromise extends PeerDecorator<infer WithoutRFP>
    ? WithoutRFP extends PromiseLike<infer U>
      ? U
      : WithoutRFP
    : WithoutPromise extends PromiseLike<infer U>
    ? U
    : WithoutPromise
  : T extends (...args: infer Args) => infer Result
  ? (...args: Args) => Promise<FromRFPInternal<Result>>
  : T extends object
  ? { [K in keyof T]: FromRFP<T[K]> }
  : T;

export type FromRFP<T> = FromRFPInternal<T>;

export type RfpResponseStatusType = 'resolve' | 'reject' | 'initial';

export type IRfpNextResponse = () => void;

export type RfpReceive<TPeer extends RfpPeer = RfpPeer, Data extends any = any> = (
  request: PeerRequest<TPeer, Data>,
  next: IRfpNextResponse,
) => any;
