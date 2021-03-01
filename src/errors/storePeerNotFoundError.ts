export class StorePeerNotFoundError extends Error {
  constructor() {
    super('Store peer is not found');

    this.name = 'StorePeerNotFoundError';
    this.message = 'Store peer is not found';
  }
}
