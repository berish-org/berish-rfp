import { send } from './send';
import { PeerRequest } from './createRequest';
import { Peer } from '../peer';

export async function sendInitial<Resolve = any, Data = any>(outcomeRequest: PeerRequest<Peer, Data>) {
  const { peer, chunk } = outcomeRequest;
  return send<Resolve, Data>(peer, chunk);
}
