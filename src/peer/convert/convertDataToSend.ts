import type { Peer } from '../peer';
import {
  SYMBOL_SERBER_PEER,
  SYMBOL_SERBER_REGISTRATOR,
  SYMBOL_SERBER_DEFERRED_LIST,
  SYMBOL_SERBER_CHUNK_REPLY_PATH,
  DeferredReceiveList,
} from '../../serber';
import { SYMBOL_SERBER_REQUEST } from '../../serber/peerDecoratorToResultPlugin';

import { PeerRequest } from '../receiveType';

export function convertDataToSend(
  peer: Peer,
  data: any,
  deferredList: DeferredReceiveList,
  incomeRequest?: PeerRequest<Peer, any>,
) {
  const replyPath = incomeRequest && incomeRequest.chunk && incomeRequest.chunk.path;

  return peer.serberInstance.serializeAsync(
    data,
    {
      [SYMBOL_SERBER_PEER]: peer,
      [SYMBOL_SERBER_DEFERRED_LIST]: deferredList,
      [SYMBOL_SERBER_REGISTRATOR]: null,
      [SYMBOL_SERBER_CHUNK_REPLY_PATH]: replyPath,
      [SYMBOL_SERBER_REQUEST]: incomeRequest,
    },
    { throwWhenError: true },
  );
}
