export class PeerInitialConnectionError extends Error {
  constructor() {
    super('Peer initial connection fault');

    this.name = 'PeerInitialConnectionError';
    this.message = 'Peer initial connection fault';
  }
}
