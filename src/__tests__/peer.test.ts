import * as faker from 'faker';
import * as http from 'http';
import SocketIO from 'socket.io';
import SocketIOClient from 'socket.io-client';

import { AddressInfo } from 'net';
import { RfpMiddlewareReceive, RfpPeer } from '../peer';
import { Transport } from '../modules';
import { createTransportClient, createTransportServer } from './createTransport';

let httpServer: http.Server = null;
let httpServerAddress: AddressInfo = null;
let socketServer: SocketIO.Server = null;
let socketServerAddress: string = null;
let socketClientPeer: SocketIOClient.Socket = null;
let socketClientTransport: Transport<SocketIOClient.Socket> = null;
let socketServerTransport: Transport<SocketIO.Socket> = null;

beforeAll((done) => {
  httpServer = http.createServer().listen();
  httpServerAddress = httpServer.address() as AddressInfo;
  socketServer = SocketIO(httpServer);
  socketServer.on('connection', (socket) => {
    socketServerTransport = createTransportServer(socket);
  });
  socketServerAddress = `http://127.0.0.1:${httpServerAddress.port}`;
  done();
});

beforeEach((done) => {
  socketClientPeer = SocketIOClient.connect(socketServerAddress, { transports: ['websocket'] });
  socketClientPeer.on('connect', () => {
    socketClientTransport = createTransportClient(socketClientPeer);
    done();
  });
});

afterEach((done) => {
  if (socketClientPeer.connected) {
    socketClientPeer.disconnect();
  }
  done();
});

afterAll((done) => {
  socketServer.close();
  httpServer.close();
  done();
});

describe('тестирование пира', () => {
  test('пир должен открываться и закрываться', (done) => {
    const socketServerRfpPeer = new RfpPeer();
    const socketClientRfpPeer = new RfpPeer().setTransport(socketClientTransport);
    expect(socketServerRfpPeer.isConnected).toBe(false);
    socketServerRfpPeer.setTransport(socketServerTransport);
    expect(socketServerRfpPeer.isConnected).toBe(true);
    socketServerRfpPeer.disconnect();
    expect(socketServerRfpPeer.isConnected).toBe(false);

    expect(socketClientRfpPeer.isConnected).toBe(true);
    socketClientRfpPeer.connect();
    expect(socketClientRfpPeer.isConnected).toBe(true);
    socketClientRfpPeer.disconnect();
    expect(socketClientRfpPeer.isConnected).toBe(false);

    done();
  });
  test('получение данных', (done) => {
    const socketServerRfpPeer = new RfpPeer().setTransport(socketServerTransport);
    const socketClientRfpPeer = new RfpPeer().setTransport(socketClientTransport);
    socketServerRfpPeer.connect();
    socketClientRfpPeer.connect();

    socketServerRfpPeer.receive('hey', ({ chunk }) => {
      expect(chunk).toBeDefined();
      expect(chunk.chunkId).toContain('chunk');
      expect(chunk.body).toBe('hello world');
      expect(chunk.path).toBe('hey');
      socketServerRfpPeer.disconnect();
      socketClientRfpPeer.disconnect();
      done();
    });

    socketClientRfpPeer.send({ body: 'hello world', path: 'hey' });
  });

  test('send на несуществующий путь', async (done) => {
    const socketServerRfpPeer = new RfpPeer().setTransport(socketServerTransport);
    const socketClientRfpPeer = new RfpPeer().setTransport(socketClientTransport);

    try {
      const res = await socketClientRfpPeer.send({ body: 'hello world', path: 'hey' });
      expect(false).toBeTruthy();
    } catch (err) {
      expect(err).toBe('path is not found');
    } finally {
      done();
    }
  });

  test('ответ на получение данных по подписке на chunk', async (done) => {
    const socketServerRfpPeer = new RfpPeer().setTransport(socketServerTransport);
    const socketClientRfpPeer = new RfpPeer().setTransport(socketClientTransport);
    socketServerRfpPeer.connect();
    socketClientRfpPeer.connect();

    socketClientRfpPeer.receive('qwe', ({ chunk: replyChunk }) => {
      expect(replyChunk).toBeDefined();
      expect(replyChunk.body).toBe('myexc');
      socketServerRfpPeer.disconnect();
      socketClientRfpPeer.disconnect();
      done();
    });
    socketServerRfpPeer.receive('hey', (chunk, next) => {
      socketServerRfpPeer.send({ path: 'qwe', body: 'myexc' });
      return 'myexc';
    });

    socketClientRfpPeer.send({ body: 'hello world', path: 'hey' });
  });

  test('ответ на получение данных по подписке на promise', async (done) => {
    const socketServerRfpPeer = new RfpPeer().setTransport(socketServerTransport);
    const socketClientRfpPeer = new RfpPeer().setTransport(socketClientTransport);
    socketServerRfpPeer.connect();
    socketClientRfpPeer.connect();

    socketServerRfpPeer.receive('hey', (req, next) => {
      return 'myexc';
    });

    socketClientRfpPeer.send({ body: 'hello world', path: 'hey' }).then((replyChunk) => {
      expect(replyChunk).toBeDefined();
      expect(replyChunk.replyId).toEqual(replyChunk.replyChunk.chunkId);
      expect(replyChunk.status).toBe('resolve');
      expect(replyChunk.body).toBe('myexc');
      socketServerRfpPeer.disconnect();
      socketClientRfpPeer.disconnect();
      done();
    });
  });
});

describe('тестирование передачи отпечатков', () => {
  test('вложенность первого уровня', async (done) => {
    const socketServerRfpPeer = new RfpPeer().setTransport(socketServerTransport);
    const socketClientRfpPeer = new RfpPeer().setTransport(socketClientTransport);

    const sum = (a: number, b: number) => a + b;

    socketServerRfpPeer.receive('hey', (req, next) => {
      return sum;
    });

    const lib = await socketClientRfpPeer.send({ path: 'hey', body: null });
    expect(lib.body).toBeDefined();
    const a = 13;
    const b = 17;
    const c = await lib.body(a, b);
    expect(c).toEqual(a + b);

    done();
  });

  test('вложенность второго уровня (объект)', async (done) => {
    const socketServerRfpPeer = new RfpPeer().setTransport(socketServerTransport);
    const socketClientRfpPeer = new RfpPeer().setTransport(socketClientTransport);

    const libServer = {
      minus: (a, b) => a - b,
      sum: (a, b) => a + b,
    };

    socketServerRfpPeer.receive('hey', (req, next) => {
      return libServer;
    });

    const libClient = await socketClientRfpPeer.send({ path: 'hey', body: null });
    expect(libClient.body).toBeDefined();

    const a = 54;
    const b = 32;

    const sum = await libClient.body.sum(a, b);
    const minus = await libClient.body.minus(a, b);

    expect(sum).toEqual(libServer.sum(a, b));
    expect(minus).toEqual(libServer.minus(a, b));

    done();
  });

  test('эмуляция бэкенда', async (done) => {
    const socketServerRfpPeer = new RfpPeer().setTransport(socketServerTransport);
    const socketClientRfpPeer = new RfpPeer().setTransport(socketClientTransport);

    const books: { [id: string]: string } = {};

    const libServer = {
      book: {
        create: (name: string) => {
          const id = faker.random.uuid();
          books[id] = name;
          return id;
        },
        delete: (id: string) => {
          delete books[id];
        },
        read: (id: string) => books[id],
        update: (id: string, name: string) => {
          books[id] = name;
          return id;
        },
      },
    };

    socketServerRfpPeer.receive('hey', (chunk, next) => {
      return libServer;
    });

    const libClient = await socketClientRfpPeer.send({ path: 'hey', body: null });
    expect(libClient.body).toBeDefined();

    const firstName = faker.name.title();

    const idBook1 = await libClient.body.book.create(firstName);
    let bookName = await libClient.body.book.read(idBook1);

    expect(bookName).toEqual(firstName);

    const secondName = faker.name.title();

    await libClient.body.book.update(idBook1, secondName);
    bookName = await libClient.body.book.read(idBook1);

    expect(bookName).not.toEqual(firstName);
    expect(bookName).toEqual(secondName);

    await libClient.body.book.delete(idBook1);

    const bookName2 = await libClient.body.book.read(idBook1);

    expect(bookName2).toBeUndefined();

    done();
  });

  test('вызов себя через другого клиента', async (done) => {
    const socketServerRfpPeer = new RfpPeer().setTransport(socketServerTransport);
    const socketClientRfpPeer = new RfpPeer().setTransport(socketClientTransport);

    socketServerRfpPeer.receive('hey', ({ chunk }, next) => {
      return chunk.body;
    });

    const lib = await socketClientRfpPeer.send({
      body: (data: string) => data && data.toLocaleUpperCase(),
      path: 'hey',
    });
    expect(lib.body).toBeDefined();

    const c = await lib.body('hello');
    expect(c).toEqual('HELLO');

    done();
  });

  test('возврат функции, которая возвращает функцию', async (done) => {
    const socketServerRfpPeer = new RfpPeer().setTransport(socketServerTransport);
    const socketClientRfpPeer = new RfpPeer().setTransport(socketClientTransport);

    const test = (a: number) => {
      return (b: number, c: number) => {
        return a + b + c;
      };
    };

    socketServerRfpPeer.receive('hey', (chunk, next) => {
      return test;
    });

    const lib = await socketClientRfpPeer.send({
      body: null,
      path: 'hey',
    });
    expect(lib.body).toBeDefined();

    const c = await lib.body(2);
    const sum = await c(3, 1);
    expect(sum).toEqual(6);

    done();
  });

  test('возврат функции, которая привязана к классу', async (done) => {
    const socketServerRfpPeer = new RfpPeer().setTransport(socketServerTransport);
    const socketClientRfpPeer = new RfpPeer().setTransport(socketClientTransport);

    class Math {
      private _c: number = null;
      constructor(c: number) {
        this._c = c;
      }
      public sum = (a: number, b: number) => {
        // console.log(this);
        return a + b + this._c;
      };
    }

    socketServerRfpPeer.receive('hey', (chunk, next) => {
      return new Math(3).sum;
    });

    const lib = await socketClientRfpPeer.send({
      body: null,
      path: 'hey',
    });
    const sum = await lib.body(2, 3);
    // console.log(sum);
    // console.log(lib.body);
    // const c = await lib.body;
    // const sum = await c(3, 1);
    // expect(sum).toEqual(6);

    done();
  });

  test('возврат класса с функциями', async (done) => {
    const socketServerRfpPeer = new RfpPeer().setTransport(socketServerTransport);
    const socketClientRfpPeer = new RfpPeer().setTransport(socketClientTransport);

    class Data {
      public array: any[] = [
        { id: 1, title: 'sherlock' },
        { id: 2, title: 'watson' },
      ];

      public async where(func: (m) => boolean | Promise<boolean>) {
        const results = await Promise.all(this.array.map(async (m) => await func(m)));
        this.array = this.array.filter((m, i) => results[i]);
        return this;
      }
    }

    socketServerRfpPeer.receive('hey', function (req) {
      return new Data();
    });

    const response = await socketClientRfpPeer.send({
      path: 'hey',
    });
    const linq = response.body as Data;

    const item = (await linq.where(async (m) => (m.title as string).toUpperCase() === 'WATSON')).array[0];
    expect(item).toEqual({ id: 2, title: 'watson' });

    done();
  });
});

describe('middleware', () => {
  test('вызов и передача middleware по цепочке', async (done) => {
    const socketServerRfpPeer = new RfpPeer().setTransport(socketServerTransport);
    const socketClientRfpPeer = new RfpPeer().setTransport(socketClientTransport);

    socketServerRfpPeer.middleware((chunk, next) => {
      next();
    });

    socketServerRfpPeer.middleware((chunk, next) => {
      return 5;
    });

    const testVar = await socketClientRfpPeer.send({ path: 'hey', body: null });
    expect(testVar.body).toBe(5);

    done();
  });

  test('пробная проверка на авторизацию', async (done) => {
    const socketServerRfpPeer = new RfpPeer().setTransport(socketServerTransport);
    const socketClientRfpPeer = new RfpPeer().setTransport(socketClientTransport);

    const authMiddle: RfpMiddlewareReceive<any> = ({ chunk, peer }, next) => {
      if (chunk.body.login === 'admin') return next();
      throw new Error('its not admin');
    };
    socketServerRfpPeer.middleware(authMiddle);

    socketServerRfpPeer.receive('hey', ({ chunk }, next) => {
      if (chunk.body.password === '123456') return 'resolve by 1';
      if (chunk.body.password === '1234567') throw new Error('reject by 1');
      return next();
    });
    socketServerRfpPeer.receive('hey', ({ chunk }, next) => {
      if (chunk.body.password === '123123') return 'resolve by 2';
      throw new Error('reject by 2');
    });

    try {
      const test = await socketClientRfpPeer.send({ path: 'hey', body: { login: 'admin2' } });
      expect(true).toBeFalsy();
    } catch (err) {
      expect(err.message).toBe('its not admin');
    }

    try {
      const test = await socketClientRfpPeer.send({ path: 'hey', body: { login: 'admin' } });
      expect(true).toBeFalsy();
    } catch (err) {
      expect(err.message).toBe('reject by 2');
    }

    try {
      const test = await socketClientRfpPeer.send({
        body: { login: 'admin', password: '1234567' },
        path: 'hey',
      });
      expect(true).toBeFalsy();
    } catch (err) {
      expect(err.message).toBe('reject by 1');
    }

    try {
      const test = await socketClientRfpPeer.send({
        body: { login: 'admin', password: '123456' },
        path: 'hey',
      });
      expect(test.body).toBe('resolve by 1');
    } catch (err) {
      expect(err).toBeUndefined();
    }

    try {
      const test = await socketClientRfpPeer.send({
        body: { login: 'admin', password: '123123' },
        path: 'hey',
      });
      expect(test.body).toBe('resolve by 2');
    } catch (err) {
      expect(err).toBeUndefined();
    }

    done();
  });
});

describe('вызов ошибок', () => {
  test('throw string', async (done) => {
    const socketServerRfpPeer = new RfpPeer().setTransport(socketServerTransport);
    const socketClientRfpPeer = new RfpPeer().setTransport(socketClientTransport);
    const hey = 'hey';

    socketServerRfpPeer.receive('hey', () => {
      throw hey;
    });
    try {
      const result = await socketClientRfpPeer.send({ path: 'hey' });
      expect(false).toBeTruthy();
    } catch (err) {
      expect(err).toBe(hey);
    }
    done();
  });
  test('throw new Error()', async (done) => {
    const socketServerRfpPeer = new RfpPeer().setTransport(socketServerTransport);
    const socketClientRfpPeer = new RfpPeer().setTransport(socketClientTransport);
    const hey = 'hey';

    socketServerRfpPeer.receive('hey', () => {
      throw new Error(hey);
    });
    try {
      const result = await socketClientRfpPeer.send({ path: 'hey' });
      expect(false).toBeTruthy();
    } catch (err) {
      expect(err.message).toBe(hey);
    }
    done();
  });
  test('throw in libs', async (done) => {
    const socketServerRfpPeer = new RfpPeer().setTransport(socketServerTransport);
    const socketClientRfpPeer = new RfpPeer().setTransport(socketClientTransport);
    const hey = 'hey';

    class Test {
      public throwErrorString() {
        throw hey;
      }
      public throwErrorClass() {
        throw new Error(hey);
      }
    }

    socketServerRfpPeer.receive('hey', () => {
      return new Test();
    });
    const response = await socketClientRfpPeer.send({ path: 'hey' });
    const test = response.body as Test;

    try {
      await test.throwErrorString();
      expect(false).toBeTruthy();
    } catch (err) {
      expect(err).toBe(hey);
    }

    try {
      await test.throwErrorClass();
      expect(false).toBeTruthy();
    } catch (err) {
      expect(err.message).toBe(hey);
    }

    done();
  });
});
