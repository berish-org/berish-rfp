import { ITransportAdapter, Transport } from '../modules';

export function createAdapterServer(socket: SocketIO.Socket) {
  const adapter: ITransportAdapter<SocketIO.Socket> = {
    transport: socket,
    send: (path, data) => socket.emit(path, data),
    subscribe: (path, cb) => {
      socket.on(path, cb);
      return () => {
        socket.off(path, cb);
      };
    },
  };
  return adapter;
}

export function createAdapterClient(socket: SocketIOClient.Socket) {
  const adapter: ITransportAdapter<SocketIOClient.Socket> = {
    transport: socket,
    send: (path, data) => socket.emit(path, data),
    subscribe: (path, cb) => {
      socket.on(path, cb);
      return () => {
        socket.off(path, cb);
      };
    },
  };
  return adapter;
}

export function createTransportServer(socket: SocketIO.Socket) {
  return new Transport(createAdapterServer(socket), 'rfp');
}

export function createTransportClient(socket: SocketIOClient.Socket) {
  return new Transport(createAdapterClient(socket), 'rfp');
}
