import * as http from 'http';
import { AddressInfo } from 'net';
import SocketIO from 'socket.io';
import SocketIOClient from 'socket.io-client';

import { getContextAside, getNamesArguments, setName, setContextAside } from '../helpers';
import { IRfpRequest, RfpPeer } from '../peer';
import { Transport } from '../modules';
import { createTransportClient, createTransportServer } from './createTransport';

function test1(a: number) {
  return a || 0;
}

export async function prepareIO() {
  let httpServer: http.Server = null;
  let httpServerAddress: AddressInfo = null;
  let socketServer: SocketIO.Server = null;
  let socketServerAddress: string = null;
  let socketClientPeer: SocketIOClient.Socket = null;
  let socketServerPeer: SocketIO.Socket = null;
  let socketServerTransport: Transport<SocketIO.Socket> = null;

  httpServer = http.createServer().listen();
  httpServerAddress = httpServer.address() as AddressInfo;
  socketServer = SocketIO(httpServer);
  socketServer.on('connection', socket => {
    socketServerPeer = socket;
    socketServerTransport = createTransportServer(socket);
  });
  socketServerAddress = `http://127.0.0.1:${httpServerAddress.port}`;

  socketClientPeer = SocketIOClient.connect(socketServerAddress, { transports: ['websocket'] });
  await new Promise(resolve =>
    socketClientPeer.on('connect', () => {
      resolve();
    })
  );

  const socketServerRfpPeer = new RfpPeer().setTransport(socketServerTransport);
  const socketClientRfpPeer = new RfpPeer().setTransport(createTransportClient(socketClientPeer));

  return {
    close: () => {
      if (socketClientPeer.connected) {
        socketClientPeer.disconnect();
      }
      socketServer.close();
      httpServer.close();
    },
    socketClientPeer,
    socketClientRfpPeer,
    socketServerPeer,
    socketServerRfpPeer,
  };
}

describe('привязка контекста', () => {
  test('Получение аргументов функции', done => {
    expect(getNamesArguments(null)).toEqual([]);

    function test(a: number, b: number) {
      return a + b;
    }
    expect(getNamesArguments(test)).toEqual(['a', 'b']);

    const test2 = (a: number, b: number) => {
      return a + b;
    };
    expect(getNamesArguments(test2)).toEqual(['a', 'b']);

    done();
  });

  test('задать имя', done => {
    const newTest = setName(test1, 'myBro');
    expect(test1.name).toBe('test1');
    expect(newTest.name).toBe('myBro');
    expect(test1(5)).toBe(5);
    expect(newTest(5)).toBe(5);

    done();
  });

  test('получение request в функции отпечатка', async done => {
    const io = await prepareIO();
    io.socketClientRfpPeer.setSerberLevel('production');
    io.socketServerRfpPeer.setSerberLevel('production');

    const libServer = {
      getSum: (a, b, rfp?) => {
        expect(rfp).not.toBeUndefined();
        return a + b;
      },
    };

    io.socketServerRfpPeer.receive('hey', ({ chunk }, next) => {
      return libServer;
    });

    const libClient = await io.socketClientRfpPeer.send({ path: 'hey', body: null });
    expect(libClient.body).toBeDefined();

    const a = 54;
    const b = 32;
    const sum = await libClient.body.getSum(a, b);
    expect(sum).toEqual(libServer.getSum(a, b, {}));

    done();
  });

  test('задать контекст', async done => {
    const io = await prepareIO();
    io.socketClientRfpPeer.setSerberLevel('production');
    io.socketServerRfpPeer.setSerberLevel('production');

    const libServer = {
      getAside: (rfp?: IRfpRequest) => {
        return getContextAside(rfp);
      },
    };

    io.socketServerRfpPeer.receive('hey', ({ chunk }, next) => {
      return libServer;
    });

    const libClient = await io.socketClientRfpPeer.send({ path: 'hey', body: null });
    expect(libClient.body).toBeDefined();

    const a = 54;
    const b = 32;
    const contextInfo = 'hello';
    const getAsideWithContext = setContextAside(libClient.body.getAside, contextInfo);
    const contextInfoServer = await getAsideWithContext(a, b);
    expect(contextInfoServer).toEqual(contextInfo);

    done();
  });
});
