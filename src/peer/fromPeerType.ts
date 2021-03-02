import { PeerDecorator } from '../serber';

type FromPeerInternal<T> = T extends PeerDecorator<infer WithoutRFP>
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
  ? (...args: Args) => Promise<FromPeerInternal<Result>>
  : T extends object
  ? { [K in keyof T]: FromPeer<T[K]> }
  : T;

export type FromPeer<T> = FromPeerInternal<T>;
