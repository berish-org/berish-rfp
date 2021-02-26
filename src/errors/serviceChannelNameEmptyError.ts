export class ServiceChannelNameEmptyError extends Error {
  constructor() {
    super('Service channel name is empty');

    this.name = 'ServiceChannelNameEmptyError';
    this.message = 'Service channel name is empty';
  }
}
