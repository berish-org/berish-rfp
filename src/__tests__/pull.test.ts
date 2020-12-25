import * as http from 'http';
import SocketIO from 'socket.io';
import SocketIOClient from 'socket.io-client';
import { RfpPull } from '../modules';

import { AddressInfo } from 'net';
import { RfpPeer } from '../peer';
import { createTransportClient, createTransportServer } from './createTransport';

async function createServer() {
  let httpServer: http.Server = null;
  let httpServerAddress: AddressInfo = null;
  let socketServer: SocketIO.Server = null;
  let socketServerAddress: string = null;
  const socketServerRfpPeer: RfpPeer[] = [];

  httpServer = http.createServer().listen();
  httpServerAddress = httpServer.address() as AddressInfo;
  socketServer = SocketIO(httpServer);
  socketServer.on('connection', socket => {
    const peer = new RfpPeer().setTransport(createTransportServer(socket)).setSerberLevel('raw');
    socketServerRfpPeer.push(peer);
  });
  socketServerAddress = `http://127.0.0.1:${httpServerAddress.port}`;

  return {
    close: () => {
      socketServer.close();
      httpServer.close();
    },
    getRfp: () => socketServerRfpPeer,
    socketServerAddress,
  };
}

async function createClient(socketServerAddress: string) {
  let socketClientPeer: SocketIOClient.Socket = null;

  socketClientPeer = SocketIOClient.connect(socketServerAddress, { transports: ['websocket'] });
  await new Promise(resolve =>
    socketClientPeer.on('connect', () => {
      resolve();
    })
  );
  const socketClientRfpPeer = new RfpPeer().setTransport(createTransportClient(socketClientPeer)).setSerberLevel('raw');

  return {
    close: () => {
      if (socketClientPeer.connected) {
        socketClientPeer.disconnect();
      }
    },
    socketClientPeer,
    socketClientRfpPeer,
  };
}

describe('проверка pull', () => {
  test('create pull', () => {
    const pull = new RfpPull();
    expect(pull).toBeDefined();
  });

  test('добавление пиров для сервер', async done => {
    const server = await createServer();
    await createClient(server.socketServerAddress);
    await createClient(server.socketServerAddress);

    const pull = new RfpPull();
    const clients = server.getRfp();
    pull.register(clients[0]);
    pull.register(clients[1]);

    expect(pull.peers).toEqual(clients);
    expect(clients[0].pull).toBe(pull);
    done();
  });
});
