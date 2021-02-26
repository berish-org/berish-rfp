export class TransportNameEmptyError extends Error {
  constructor() {
    super('Transport name is empty');

    this.name = 'TransportNameEmptyError';
    this.message = 'Transport name is empty';
  }
}
