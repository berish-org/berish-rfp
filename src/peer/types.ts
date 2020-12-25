import { IWithRfp, IFunctionPrint } from '../serber';
import { RfpPeer } from './peer';

type FromRFPInternal<T> = T extends IWithRfp<infer WithoutRFP>
  ? WithoutRFP extends PromiseLike<infer WithoutPromise>
    ? WithoutPromise extends IWithRfp<infer U>
      ? U
      : WithoutPromise
    : WithoutRFP extends IWithRfp<infer U>
    ? U
    : WithoutRFP
  : T extends PromiseLike<infer WithoutPromise>
  ? WithoutPromise extends IWithRfp<infer WithoutRFP>
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

export interface IPeerEmitterObject {
  connected: never;
  disconnected: never;
  block: IRfpChunk<any>;
  unblock: IRfpChunk<any>;
  unblockAll: never;
  requestWhenDisconnected: IFunctionPrint;
}

export interface IRfpChunkSend<Body> {
  /** Показывает путь, на который направлен текущий chunk */
  readonly path: string;
  /** Основная информация, которую передает chunk */
  readonly body?: Body;
  /** Показывает, нужно ли ждать ответ на текущий chunk */
  notWaiting?: boolean;
}

export interface IRfpChunkBlockForce {
  /** Указывает, что текущий chunk является блокатором для следующих запросов */
  isBlocker?: boolean;
  /** Указывает, что текущий chunk может пройти сквозь блокированные запросы */
  isForce?: boolean;
}

export interface IRfpChunkId {
  /** Показывает идентификатор текущего chunk */
  chunkId?: string;
  /** Показывает на какой chunk указывает текущий chunk */
  replyId?: string;
  /** Показывает запрос выполнен со статусом resolve или reject */
  status?: RfpResponseStatusType;
}

export interface IRfpChunk<Body> extends IRfpChunkSend<Body>, IRfpChunkId, IRfpChunkBlockForce {
  /** Дополнительная информация, которую можно получить из chunk */
  aside?: { [key: string]: any };
}

export type IRfpNextResponse = () => void;

export interface IRfpRequest<
  PublicStore extends {} = {},
  PrivateStore extends {} = {},
  ProtectedStore extends {} = {},
  Data extends any = any
> {
  chunk: IRfpChunk<Data>;
  peer: RfpPeer<PublicStore, PrivateStore, ProtectedStore>;
}

export type RfpReceive<
  PublicStore extends {} = {},
  PrivateStore extends {} = {},
  ProtectedStore extends {} = {},
  Data extends any = any
> = (request: IRfpRequest<PublicStore, PrivateStore, ProtectedStore, Data>, next: IRfpNextResponse) => any;
