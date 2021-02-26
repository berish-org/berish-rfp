export class TransportAdapterEmptyError extends Error {
  constructor() {
    super('Transport adapter is empty');

    this.name = 'TransportAdapterEmptyError';
    this.message = 'Transport adapter is empty';
  }
}
