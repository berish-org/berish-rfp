export class StoreChangedWhenConnectionError extends Error {
  constructor() {
    super('Store value is changed when connection');

    this.name = 'StoreChangedWhenConnectionError';
    this.message = 'Store value is changed when connection';
  }
}
