export class StoreScopeNotFoundError extends Error {
  constructor() {
    super('Store scope is not found');

    this.name = 'StoreScopeNotFoundError';
    this.message = 'Store scope is not found';
  }
}
