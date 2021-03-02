import { ConnectionError } from '../../errors';
import type { Peer } from '../peer';

import { waitConnect } from './waitConnect';

export async function connect(peer: Peer) {
  if (!peer) throw new TypeError('Peer is null');
  if (!peer.connection) throw new TypeError('Peer connection is null');

  const connected = await waitConnect(peer);
  if (!connected) throw new ConnectionError('Peer can`t to connect successfully');
}
