export class PeerIsDisconnectedError extends Error {
  constructor() {
    super('Peer is disconnected');

    this.name = 'PeerIsDisconnectedError';
    this.message = 'Peer is disconnected';
  }
}
