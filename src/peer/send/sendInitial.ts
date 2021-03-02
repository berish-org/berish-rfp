import { sendRaw } from '../sendRaw';
import { Peer } from '../peer';
import { fillChunk, PeerChunk } from '../../chunk';

export async function sendInitial<Resolve = any, Data = any>(peer: Peer, outcomeChunk: PeerChunk<Data>) {
  // Готовим chunk для отправки
  outcomeChunk = fillChunk({ ...outcomeChunk, status: 'initial' });

  peer.logger('send').info(outcomeChunk);
  const result = await sendRaw<Resolve, Data>(peer, outcomeChunk);
  peer.logger('send response').info(result.body);

  return result;
}
