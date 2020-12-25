// import serber from 'berish-serber';
// import guid from 'berish-guid';
// import Plugin from '../plugins/funcPlugin';

// import { DeferredListSymbol, PeerSymbol } from '../../constants';
// import { deferredReceiveStart, IDeferredList } from '../funcConverter';
// import { prepareIO } from './converter.test';

// describe('проверка сериализации и десериализации отпечатков', () => {
//   const serberTestScope = guid.guid();
//   const serberInstance = serber
//     .scope(serberTestScope)
//     .plugin(serber.defaults)
//     .plugin(Plugin)
//     .plugin(serber.plugins.ObjectAdapter);

//   test('прогон примитивов', done => {
//     const s123 = serberInstance.serialize(123);
//     const snull = serberInstance.serialize(null);
//     const sundefined = serberInstance.serialize(undefined);
//     const sstring = serberInstance.serialize('hello');
//     const sdate = serberInstance.serialize(new Date(0));

//     expect(s123).toEqual(123);
//     expect(snull).toBeNull();
//     expect(sundefined).toBeUndefined();
//     expect(sstring).toEqual('hello');
//     expect(sdate).toEqual({ type: '__Date', value: 0 });

//     done();
//   });

//   test('прогон примитивов через async', async done => {
//     const s123 = await serberInstance.serializeAsync(123);
//     const snull = await serberInstance.serializeAsync(null);
//     const sundefined = await serberInstance.serializeAsync(undefined);
//     const sstring = await serberInstance.serializeAsync('hello');
//     const sdate = await serberInstance.serializeAsync(new Date(0));

//     expect(s123).toEqual(123);
//     expect(snull).toBeNull();
//     expect(sundefined).toBeUndefined();
//     expect(sstring).toEqual('hello');
//     expect(sdate).toEqual({ type: '__Date', value: 0 });

//     done();
//   });

//   test('сериализация и десериализация отпечатков функций напрямую', async done => {
//     prepareIO().then(async io => {
//       function sum(a: number, b: number) {
//         return a + b;
//       }
//       io.socketServerRfpPeer.receive('hey', (chunk, next) => {
//         const deferredList: IDeferredList = {};
//         const print = serberInstance.serialize(sum, {
//           [PeerSymbol]: io.socketServerRfpPeer,
//           [DeferredListSymbol]: deferredList,
//         });
//         deferredReceiveStart(deferredList);
//         return print;
//       });
//       const receivedChunk = await io.socketClientRfpPeer.send({ path: 'hey', body: null, aside: null });
//       const sumFunc = serberInstance.deserialize(receivedChunk.body, {
//         [PeerSymbol]: io.socketClientRfpPeer,
//       });
//       expect(sumFunc).toBeDefined();
//       const result = await sumFunc(5, 6);
//       expect(result).toEqual(11);

//       io.close();
//       done();
//     });
//   });
// });
