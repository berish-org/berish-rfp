import type { PeerChunk } from '../../chunk';
import type { RfpPeer } from '../peer';
import { PeerPathNotFoundError } from '../../errors';
import { nextPromise, SYMBOL_NEXT_STEP } from '../../helpers';

import { serberDeserialize } from './serberDeserialize';
import { createRequest, PeerRequest } from './createRequest';
import { sendReject } from './sendReject';
import { sendResolve } from './sendResolve';

export async function emit(rawRequest: PeerRequest<RfpPeer, any>) {
  const { peer } = rawRequest;
  const incomeChunk = serberDeserialize(rawRequest);

  peer.logger('peer')('receive').info(incomeChunk);

  const result = await emitListeners(createRequest(peer, incomeChunk));
  if (!result) {
    const request = createRequest(peer, incomeChunk);
    await sendReject(request, new PeerPathNotFoundError());
  }
}

async function emitListeners(request: PeerRequest<RfpPeer, any>) {
  const { peer, chunk } = request;
  const events = peer.receiveEmitter.getEvents(chunk.path);

  if (!events || events.length <= 0) return false;

  for (const event of events) {
    try {
      const result = await nextPromise((next) => event.callback({ request, next }, event.eventHash));
      if (result === SYMBOL_NEXT_STEP) continue;
      else {
        await sendResolve(request, result);
        return true;
      }
    } catch (err) {
      await sendReject(request, err);
      return true;
    }
  }
  return false;
}
