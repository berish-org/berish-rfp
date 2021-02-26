export class ProxyConnectionDataConfusedError extends Error {
  constructor() {
    super('Proxy connection with data is confused');

    this.name = 'ProxyConnectionDataConfusedError';
    this.message = 'Proxy connection with data is confused';
  }
}
