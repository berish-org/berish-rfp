export class PeerDecoratorException extends Error {
  private _err: any = null;

  constructor(err: any) {
    super();
    this._err = err;
  }

  public get err() {
    return this._err;
  }
}
