import { IRfpChunk } from './types';
import { createRequest } from './methods';
import { RfpPeer } from './peer';
import { nextPromise, SYMBOL_NEXT_STEP } from '../helpers';
import { sendError } from './sendError';
import { sendResponse } from './sendResponse';
import { SYMBOL_MIDDLEWARE_LISTENERS } from '../constants';
import { serberDeserialize } from './serberDeserialize';
import { PeerPathNotFoundError } from '../errors';

export async function emit(peer: RfpPeer, incomeRawChunk: IRfpChunk<any>) {
  const incomeChunk = serberDeserialize(peer, incomeRawChunk);
  peer.getLogger()('peer')('emit').info(incomeChunk);
  const result = await emitListeners(peer, incomeChunk);
  if (!result) {
    const request = createRequest(peer, incomeChunk);
    await sendError(request, new PeerPathNotFoundError());
  }
}

async function emitListeners(peer: RfpPeer, incomeChunk: IRfpChunk<any>) {
  const { [SYMBOL_MIDDLEWARE_LISTENERS]: middlewares, [incomeChunk.path]: pathListeners } = peer.listeners;
  if (!pathListeners || pathListeners.length <= 0) return false;

  const listeners = [...middlewares, ...pathListeners];
  for (const listener of listeners) {
    const request = createRequest(peer, incomeChunk);

    try {
      const result = await nextPromise((next) => listener(request, next));
      if (result === SYMBOL_NEXT_STEP) continue;
      else {
        await sendResponse(request, result);
        return true;
      }
    } catch (err) {
      await sendError(request, err);
      return true;
    }
  }
  return false;
}
