import * as http from 'http';
import SocketIO from 'socket.io';
import SocketIOClient from 'socket.io-client';

import { AddressInfo } from 'net';
import { RfpPeer } from '../../peer';
import * as converter from '../funcConverter';
import { Transport } from '../../modules';
import { createTransportClient, createTransportServer } from '../../__tests__/createTransport';

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
  socketServer.on('connection', (socket) => {
    socketServerPeer = socket;
    socketServerTransport = createTransportServer(socket);
  });
  socketServerAddress = `http://127.0.0.1:${httpServerAddress.port}`;

  socketClientPeer = SocketIOClient.connect(socketServerAddress, { transports: ['websocket'] });
  await new Promise((resolve) =>
    socketClientPeer.on('connect', () => {
      resolve();
    }),
  );

  const socketServerRfpPeer = new RfpPeer().setTransport(socketServerTransport).setSerberLevel('raw');
  const socketClientRfpPeer = new RfpPeer().setTransport(createTransportClient(socketClientPeer)).setSerberLevel('raw');

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

describe('проверка преобразований функций и отпечатков функций', () => {
  test('преобразование функции в отпечаток (function)', (done) => {
    function test(a: number, b: number) {
      return a + b;
    }
    const print = converter.getPrintFunction(test);
    expect(print).toBeDefined();
    expect(print.args[0]).toBe('a');
    expect(print.args[1]).toBe('b');
    expect(print.name).toBe('test');
    expect(print.type).toEqual(converter.PRINT_FUNCTION_TYPE);
    expect(print.printId).toBeDefined();
    done();
  });
  test('преобразование функции в отпечаток (() => {})', (done) => {
    const test = (a: number, b: number) => a + b;
    const print = converter.getPrintFunction(test);
    expect(print).toBeDefined();
    expect(print.args[0]).toBe('a');
    expect(print.args[1]).toBe('b');
    expect(print.name).toBe('test');
    expect(print.type).toEqual(converter.PRINT_FUNCTION_TYPE);
    expect(print.printId).toBeDefined();
    done();
  });
  test('преобразование функции в отпечаток ((...args) => {})', (done) => {
    const test = (...params) => params[0] + params[1];
    const print = converter.getPrintFunction(test);
    expect(print).toBeDefined();
    // expect(print.args[0]).toBe('...params');
    done();
  });
  test('преобразование отпечатка функции в (function)', (done) => {
    function test(a: number, b: number) {
      return a + b;
    }
    const print = converter.getPrintFunction(test);
    expect(print).toBeDefined();
    const func = converter.getNormalFunction(print, null);
    expect(func).toBeDefined();
    done();
  });
  test('удаленный вызов функции по отпечатку (мгновенная прослушка)', (done) => {
    prepareIO().then(async (io) => {
      function sum(a: number, b: number) {
        return a + b;
      }
      io.socketServerRfpPeer.receive('hey', (chunk, action) => {
        const print = converter.getPrintFunction(sum);
        converter.startReceivePrintFunction(print, io.socketServerRfpPeer, null);
        return print;
      });
      const receivedChunk = await io.socketClientRfpPeer.send({ path: 'hey', body: null, aside: null });
      const printOfSum = receivedChunk.body;
      const sumFuncFromPrint = converter.getNormalFunction(printOfSum, io.socketClientRfpPeer);

      expect(sumFuncFromPrint).toBeDefined();

      const result = await sumFuncFromPrint(5, 6);
      expect(result).toEqual(11);

      io.close();
      done();
    });
  });
  test('удаленный вызов функции по отпечатку (отложенная прослушка)', (done) => {
    prepareIO().then(async (io) => {
      function sum(a: number, b: number) {
        return a + b;
      }
      io.socketServerRfpPeer.receive('hey', (chunk, next) => {
        const deferredFuncs = {};
        const print1 = converter.getPrintFunction(sum);
        const print2 = converter.getPrintFunction(sum);
        const print3 = converter.getPrintFunction(sum);
        converter.deferredReceivePrintFunction(print1, io.socketServerRfpPeer, deferredFuncs, null);
        converter.deferredReceivePrintFunction(print2, io.socketServerRfpPeer, deferredFuncs, null);
        converter.deferredReceivePrintFunction(print3, io.socketServerRfpPeer, deferredFuncs, null);

        converter.deferredReceiveStart(deferredFuncs);
        return print1;
      });
      const receivedChunk = await io.socketClientRfpPeer.send({ path: 'hey', body: null, aside: null });
      const printOfSum = receivedChunk.body;
      const sumFuncFromPrint = converter.getNormalFunction(printOfSum, io.socketClientRfpPeer);

      expect(sumFuncFromPrint).toBeDefined();

      const result = await sumFuncFromPrint(5, 6);
      expect(result).toEqual(11);

      io.close();
      done();
    });
  });
});
