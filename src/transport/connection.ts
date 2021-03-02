import { createRequest, emit, Peer } from '../peer';
import { PeerTransport, PeerTransportAdapter } from '../transport';

export class PeerConnection<TPeerTransportAdapter extends PeerTransportAdapter> {
  private _transport: PeerTransport<TPeerTransportAdapter> = null;
  private _peer: Peer = null;
  private _connectionId: string = null;
  private _isEnabled: boolean = false;

  private constructor(peer: Peer, transport: PeerTransport<TPeerTransportAdapter>) {
    if (!peer) throw new TypeError('PeerConnection peer is null');
    if (!transport) throw new TypeError('PeerConnection transport is null');

    this._transport = transport;
    this._peer = peer;
  }

  public get transport() {
    return this._transport;
  }

  public get peer() {
    return this._peer;
  }

  public get isEnabled() {
    return !!this._connectionId;
  }

  public transportConnect() {
    if (!this.isEnabled)
      this._connectionId = this._transport.subscribe(this.peer, (data) => {
        const request = createRequest(this.peer, data);

        emit(request);
      });
  }

  public transportDisconnect() {
    if (this.isEnabled) {
      this._transport.unsubscribe(this._connectionId);
      this._connectionId = null;
    }
  }

  public static create<TPeerTransportAdapter extends PeerTransportAdapter>(
    transport: PeerTransport<TPeerTransportAdapter>,
    peer: Peer,
  ) {
    const connection = new PeerConnection(peer, transport);
    return connection;
  }
}
