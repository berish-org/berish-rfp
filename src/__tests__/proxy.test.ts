import * as http from 'http';
import { AddressInfo } from 'net';
import SocketIO from 'socket.io';
import SocketIOClient from 'socket.io-client';
import { RfpPeer } from '../peer';
import { createTransportClient, createTransportServer } from './createTransport';

function createServer(onConnect: (peer: RfpPeer, socket: SocketIO.Socket) => any) {
  let httpServer: http.Server = null;
  let httpServerAddress: AddressInfo = null;
  let server: SocketIO.Server = null;
  let address: string = null;

  httpServer = http.createServer().listen();
  httpServerAddress = httpServer.address() as AddressInfo;
  server = SocketIO(httpServer);
  server.on('connection', (socket) => {
    const peer = new RfpPeer().setTransport(createTransportServer(socket));
    onConnect(peer, socket);
  });
  address = `http://127.0.0.1:${httpServerAddress.port}`;

  return {
    address,
    close: () => {
      server.close();
      httpServer.close();
    },
  };
}

async function createClient(socketServerAddress: string) {
  let socket: SocketIOClient.Socket = null;

  socket = SocketIOClient.connect(socketServerAddress, { transports: ['websocket'] });
  await new Promise((resolve) =>
    socket.on('connect', () => {
      resolve();
    }),
  );
  const peer = new RfpPeer().setTransport(createTransportClient(socket)).setSerberLevel('raw');

  return {
    close: () => {
      if (socket.connected) {
        socket.disconnect();
      }
    },
    peer,
    socket,
  };
}

describe('Тестирование dev manager', () => {
  test('подключение', async (done) => {
    const onConnect = (peer: RfpPeer) => {
      const { proxy } = peer;
      proxy.server.start('123456');

      peer.receive('hey', (req) => {
        return 'hey ' + req.chunk.body;
      });
    };
    const server = createServer(onConnect);

    const client = await createClient(server.address);
    const { body: res1 } = await client.peer.send({ path: 'hey', body: 'Ravil' });
    expect(res1).toBe('hey Ravil');

    const devServer = await createClient(server.address);
    devServer.peer.receive('hey', (req) => {
      return 'bye ' + req.chunk.body;
    });
    await devServer.peer.proxy.client.connect('123456');

    const { body: res2 } = await client.peer.send({ path: 'hey', body: 'Ravil' });
    expect(res2).toBe('bye Ravil');

    devServer.close();
    server.close();
    done();
  });
});
