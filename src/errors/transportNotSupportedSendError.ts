export class TransportNotSupportedSendError extends Error {
  constructor() {
    super('Transport don`t supported send');

    this.name = 'TransportNotSupportedSendError';
    this.message = 'Transport don`t supported send';
  }
}
