import type { Peer } from '../peer';
import { PeerPathNotFoundError } from '../../errors';
import { nextPromise, SYMBOL_NEXT_STEP } from '../../helpers';

import { convertFromReceive } from '../convert';
import { sendReject, sendResolve } from '../send';
import { PeerRequest } from '../receiveType';

export async function emit(rawRequest: PeerRequest<Peer, any>) {
  try {
    if (!rawRequest.peer) throw new TypeError('receive invalid data: peer');
    if (!rawRequest.chunk) throw new TypeError('receive invalid data: chunk');

    const incomeRequest = await convertFromReceive(rawRequest);
    const { peer, chunk } = incomeRequest;

    peer.logger('peer')('receive').info(chunk);

    const events = peer.receiveEmitter.getEvents(chunk.path);

    if (events.length <= 0) return sendReject(peer, new PeerPathNotFoundError(), chunk);

    for (const event of events) {
      try {
        const result = await nextPromise((next) => event.callback({ request: incomeRequest, next }, event.eventHash));
        if (result === SYMBOL_NEXT_STEP) continue;
        else return sendResolve(peer, result, chunk);
      } catch (err) {
        return sendReject(peer, err, chunk);
      }
    }

    return sendReject(peer, new PeerPathNotFoundError(), chunk);
  } catch (err) {
    if (rawRequest.peer && rawRequest.chunk) {
      return sendReject(rawRequest.peer, err, rawRequest.chunk);
    }
  }
}
