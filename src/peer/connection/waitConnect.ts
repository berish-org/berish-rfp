import guid from 'berish-guid';
import type { Peer } from '../peer';

export function waitConnect(peer: Peer) {
  const generateConnectionCode = guid.generateId();

  let receiveHash = peer.serviceChannel.receive<string>('peer', 'connection', ({ serviceData }) => {
    peer.unreceive(receiveHash);
    receiveHash = null;
    return serviceData;
  });

  return new Promise<boolean>(async (resolve) => {
    try {
      const { data: result } = await peer.serviceChannel.send<string, string>(
        'peer',
        'connection',
        generateConnectionCode,
        {
          isBlocker: true,
        },
      );
      if (result === generateConnectionCode) return resolve(true);
      return resolve(false);
    } catch (err) {
      return resolve(false);
    }
  });
}
