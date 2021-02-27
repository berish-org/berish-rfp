export type PeerResponseStatusType = 'resolve' | 'reject' | 'initial';

export interface PeerChunkId {
  /** Показывает идентификатор текущего chunk */
  chunkId?: string;
  /** Показывает на какой chunk указывает текущий chunk */
  replyId?: string;
}

export interface PeerChunkBody<Body> {
  /** Показывает путь, на который направлен текущий chunk */
  readonly path: string;

  /** Основная информация, которую передает chunk */
  readonly body?: Body;

  /** Показывает, нужно ли ждать ответ на текущий chunk */
  notWaiting?: boolean;

  /** Показывает запрос выполнен со статусом resolve или reject */
  status?: PeerResponseStatusType;
}

export interface PeerChunkBlockForce {
  /** Указывает, что текущий chunk является блокатором для следующих запросов */
  isBlocker?: boolean;
  /** Указывает, что текущий chunk может пройти сквозь блокированные запросы */
  isForce?: boolean;
}

export interface PeerChunkAside {
  /** Дополнительная информация, которую можно получить из chunk */
  aside?: { [key: string]: any };
}

export type PeerChunk<Body> = PeerChunkId & PeerChunkBody<Body> & PeerChunkBlockForce & PeerChunkAside;
