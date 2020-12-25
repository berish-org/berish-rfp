// import { DynamicStore } from 'berish-stober';
// import * as http from 'http';
// import { createStore } from 'redux';
// import SocketIO from 'socket.io';
// import SocketIOClient from 'socket.io-client';

// import { AddressInfo } from 'net';
// import { RfpPeer } from '../peer';
// import { RfpStore } from '../store';
// import { Transport } from '../transport';
// import { createTransportClient, createTransportServer } from './createTransport';

// let httpServer: http.Server = null;
// let httpServerAddress: AddressInfo = null;
// let socketServer: SocketIO.Server = null;
// let socketServerAddress: string = null;
// let socketClientPeer: SocketIOClient.Socket = null;
// let socketClientTransport: Transport<SocketIOClient.Socket> = null;
// let socketServerTransport: Transport<SocketIO.Socket> = null;

// beforeAll(done => {
//   httpServer = http.createServer().listen();
//   httpServerAddress = httpServer.address() as AddressInfo;
//   socketServer = SocketIO(httpServer);
//   socketServer.on('connection', socket => {
//     socketServerTransport = createTransportServer(socket);
//   });
//   socketServerAddress = `http://127.0.0.1:${httpServerAddress.port}`;
//   done();
// });

// beforeEach(done => {
//   socketClientPeer = SocketIOClient.connect(socketServerAddress, { transports: ['websocket'] });
//   socketClientPeer.on('connect', () => {
//     socketClientTransport = createTransportClient(socketClientPeer);
//     done();
//   });
// });

// afterEach(done => {
//   if (socketClientPeer.connected) {
//     socketClientPeer.disconnect();
//   }
//   done();
// });

// afterAll(done => {
//   socketServer.close();
//   httpServer.close();
//   done();
// });

// describe('проверка store', () => {
//   test('инициализация', async done => {
//     class Store {
//       isAdmin: boolean;
//     }

//     const storeServer = new DynamicStore<IState>(createStore, []);
//     const storeClient = new DynamicStore<IState>(createStore, []);

//     const socketServerRfpStore = new RfpStore().setStoreAdapter(storeServer);
//     const socketClientRfpStore = new RfpStore().setStoreAdapter(storeClient);

//     const socketServerRfpPeer = new RfpPeer().setTransport(socketServerTransport).setStore(socketServerRfpStore);
//     const socketClientRfpPeer = new RfpPeer().setTransport(socketClientTransport).setStore(socketClientRfpStore);

//     expect(socketServerRfpPeer.store).toBe(socketServerRfpStore);
//     expect(socketClientRfpPeer.store).toBe(socketClientRfpStore);

//     done();
//   });

//   test('изменение состояния', async done => {
//     interface IState {
//       isAdmin: boolean;
//     }

//     const socketServerRfpPeer = new RfpPeer()
//       .setTransport(socketServerTransport)
//       .setStore(new RfpStore().setStoreAdapter(new DynamicStore<IState>(createStore, [])));

//     const socketClientRfpPeer = new RfpPeer()
//       .setTransport(socketClientTransport)
//       .setStore(new RfpStore().setStoreAdapter(new DynamicStore<IState>(createStore, [])));

//     expect(socketServerRfpPeer.store.state).toEqual({});
//     expect(socketClientRfpPeer.store.state).toEqual({});

//     await socketServerRfpPeer.store.setState({ isAdmin: true });
//     expect(socketServerRfpPeer.store.state).toEqual({ isAdmin: true });
//     expect(socketClientRfpPeer.store.state).toEqual({ isAdmin: true });

//     done();
//   });

//   test('получение store из chunk', async done => {
//     interface IState {
//       login: string;
//     }

//     const storeServer = new DynamicStore<IState>(createStore, []);
//     const storeClient = new DynamicStore<IState>(createStore, []);

//     const socketServerRfpStore = new RfpStore().setStoreAdapter(storeServer);
//     const socketClientRfpStore = new RfpStore().setStoreAdapter(storeClient);

//     const socketServerRfpPeer = new RfpPeer().setTransport(socketServerTransport).setStore(socketServerRfpStore);
//     const socketClientRfpPeer = new RfpPeer().setTransport(socketClientTransport).setStore(socketClientRfpStore);

//     socketClientRfpPeer.receive('hey', async ({ chunk, peer }, next) => {
//       const state = peer.store.state;
//       expect(state).toEqual({});
//       expect(chunk.body).toEqual({ login: 'admin' });

//       await peer.store.setState(chunk.body);
//       return 'ok';
//     });

//     const status = await socketServerRfpPeer.send({ path: 'hey', body: { login: 'admin' } });
//     expect(socketServerRfpPeer.store.state).toEqual({ login: 'admin' });
//     done();
//   });

//   test('задать на клиенте store, не задавая его на сервер', async done => {
//     const serverPeer = new RfpPeer().setTransport(socketServerTransport);

//     interface IState {
//       login: string;
//     }

//     const store = new DynamicStore<IState>(createStore, []);
//     const rfpStore = new RfpStore().setStoreAdapter(store);
//     const clientPeer = new RfpPeer().setTransport(socketClientTransport).setStore(rfpStore);

//     rfpStore.set('login', 'hey');
//     await rfpStore.forceUpdate();

//     expect(!!serverPeer.store).toBeTruthy();
//     expect(serverPeer.store.state).toEqual({ login: 'hey' });

//     done();
//   });
// });
