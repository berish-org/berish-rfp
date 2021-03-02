import { send } from './send';
import { PeerRequest } from './createRequest';
import { RfpPeer } from '../peer';

export async function sendInitial<Resolve = any, Data = any>(outcomeRequest: PeerRequest<RfpPeer, Data>) {
  const { peer, chunk } = outcomeRequest;
  return send<Resolve, Data>(peer, chunk);
}
