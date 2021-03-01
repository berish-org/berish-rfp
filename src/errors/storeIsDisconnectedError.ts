export class StoreIsDisconnectedError extends Error {
  constructor() {
    super('Peer store is disconnected');

    this.name = 'StoreIsDisconnectedError';
    this.message = 'Peer store is disconnected';
  }
}
