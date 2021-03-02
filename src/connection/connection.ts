import { ConnectionError } from '../errors';
import { Peer } from '../peer';
import { createRequest, emit } from '../peer/methods';
import { PeerTransport, PeerTransportAdapter } from '../transport';
import { checkConnection } from './checkConnection';

export class PeerConnection<TPeerTransportAdapter extends PeerTransportAdapter> {
  private _connectionId: string = null;
  private _peer: Peer = null;
  private _transport: PeerTransport<TPeerTransportAdapter> = null;

  private constructor(peer: Peer, transport: PeerTransport<TPeerTransportAdapter>) {
    if (!peer) throw new TypeError('PeerConnection peer is null');
    if (!transport) throw new TypeError('PeerConnection transport is null');

    this._peer = peer;
    this._transport = transport;
  }

  public get transport() {
    return this._transport;
  }

  public static async connect<TPeerTransportAdapter extends PeerTransportAdapter>(
    peer: Peer,
    transport: PeerTransport<TPeerTransportAdapter>,
  ) {
    if (!peer) throw new TypeError('PeerConnection connect peer is null');
    if (!transport) throw new TypeError('PeerConnection connect transport is null');

    const logger = peer.logger;

    if (peer.connection) return void 0;

    try {
      peer.connection = new PeerConnection<TPeerTransportAdapter>(peer, transport);

      logger.info('connect.start');
      await peer.emitter.emitStateAsync('connect.start', null);

      peer.connection._connectionId = transport.subscribe(peer, (data) => emit(createRequest(peer, data)));

      const connected = await checkConnection(peer);
      if (!connected) throw new ConnectionError('Peer can`t to connect');

      await peer.emitter.emitStateAsync('connect.finish', null);
      logger.info('connect.finish');
    } catch (err) {
      peer.connection = void 0;
      throw err;
    }
  }

  public static async disconnect(peer: Peer) {
    if (!peer) throw new TypeError('PeerConnection disconnect peer is null');

    const connection = peer && peer.connection;
    if (!connection) return void 0;

    try {
      const logger = peer.logger('peer');

      await peer.emitter.emitStateAsync('disconnect.start', null);

      connection._transport.unsubscribe(connection._connectionId);
      peer.unreceiveAll();

      logger.info('disconnect');

      await peer.emitter.emitStateAsync('disconnect.finish', null);
    } catch (err) {
      // EMPTY
    }
    peer.connection = void 0;
  }
}
