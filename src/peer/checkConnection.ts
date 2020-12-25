import guid from 'berish-guid';
import { RfpPeer } from './peer';

export function checkConnection(peer: RfpPeer) {
  const generateConnectionCode = guid.generateId();
  let unreceive = peer.serviceChannel.receive<string>('connection', ({ serviceData }) => {
    unreceive();
    unreceive = null;
    return serviceData;
  });
  return new Promise<boolean>(async resolve => {
    const { data: result } = await peer.serviceChannel.send<string, string>('connection', generateConnectionCode, {
      isBlocker: true,
    });
    if (result === generateConnectionCode) return resolve(true);
    return resolve(false);
  });
}
