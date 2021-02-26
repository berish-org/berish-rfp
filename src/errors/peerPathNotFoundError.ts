export class PeerPathNotFoundError extends Error {
  constructor() {
    super('Path in current peer not found');

    this.name = 'PeerPathNotFoundError';
    this.message = 'Path in current peer not found';
  }
}
