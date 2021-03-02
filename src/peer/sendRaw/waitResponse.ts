import type { PeerChunk } from '../../chunk';
import { Peer } from '../peer';

export type PeerChunkReply<OutcomeData, IncomeData> = PeerChunk<IncomeData> & { replyChunk: PeerChunk<OutcomeData> };

export async function waitResponse<IncomeData = any, OutcomeData = any>(
  peer: Peer,
  outcomeChunk: PeerChunk<OutcomeData>,
): Promise<PeerChunkReply<OutcomeData, IncomeData>> {
  const data = await peer.receiveEmitter.waitEvent(outcomeChunk.chunkId);

  const incomeChunk = data && data.request && data.request.chunk;
  if (!incomeChunk) return void 0;

  if (incomeChunk.status === 'reject') throw incomeChunk.body;
  if (incomeChunk.status === 'resolve') return { ...incomeChunk, replyChunk: outcomeChunk };

  return void 0;
}
