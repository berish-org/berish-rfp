export class ConnectionError extends Error {
  constructor(message: string) {
    super(`Connection Error: ${message}`);

    this.name = 'ConnectionError';
    this.message = `Connection Error: ${message}`;
  }
}
