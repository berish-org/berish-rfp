// import serber from 'berish-serber';
// import guid from 'berish-guid';

// import { prepareIO } from '../../__tests__/context.test';
// import { RegistratorSymbol } from '../../constants';
// import * as classRegistrator from '../classRegistrator';
// import * as Plugins from '../plugins';

// class Test {
//   public name = 'Ravil';

//   public hey() {
//     return 'hello ' + this.name;
//   }
// }

// describe('проверка (де)сериализации класса', () => {
//   test('проверка обычным json', done => {
//     const obj = new Test();

//     const serialized = JSON.stringify(obj);
//     expect(serialized).toEqual(`{"name":"Ravil"}`);

//     const deserialized = JSON.parse(serialized);
//     expect(deserialized instanceof Test).toBeFalsy();

//     const normalDeserialized = classRegistrator.setPrototype(deserialized, Test.prototype) as Test;
//     expect(normalDeserialized instanceof Test).toBeTruthy();
//     expect(normalDeserialized.hey()).toBe('hello Ravil');
//     expect(Test.prototype).toBe(classRegistrator.getPrototype(obj));

//     done();
//   });

//   test('проверка через registrator вспомогательных методов', done => {
//     const registrator = new classRegistrator.Registrator();
//     registrator.register('Test', Test);

//     expect(registrator.clsIsRegistered(Test)).toBeTruthy();
//     expect(registrator.isRegistered('Test')).toBeTruthy();
//     expect(registrator.protoIsRegistered(Test.prototype as any)).toBeTruthy();
//     expect(registrator.objToClassName(new Test())).toBe('Test');
//     expect(registrator.objFromInstance(new Test())).toEqual({ name: 'Ravil' });
//     expect(
//       registrator.objToClassName(registrator.instanceFromObj(registrator.objFromInstance(new Test()), 'Test'))
//     ).toBe('Test');

//     registrator.unregister('Test');
//     done();
//   });

//   test('проверка ручных отпечатков', done => {
//     const registrator = new classRegistrator.Registrator();
//     registrator.register('Test', Test);

//     const print = registrator.getPrintInstance(new Test());
//     expect(print).toEqual({ className: 'Test', instance: { name: 'Ravil' }, type: classRegistrator.PRINT_CLASS_TYPE });

//     const newInstance = registrator.getNormalInstance(print);
//     expect(newInstance.hey()).toBe('hello Ravil');

//     registrator.unregister('Test');
//     done();
//   });

//   test('проверка сериализации и десериализации отпечатков экземпляров класса', async done => {
//     const serberTestScope = guid.guid();
//     const serberInstance = serber
//       .scope(serberTestScope)
//       .plugin(serber.defaults)
//       .plugin(Plugins.ClassPlugin)
//       .plugin(serber.plugins.ObjectAdapter);

//     class Book {
//       public title: string = null;
//       public author: string = null;

//       public getFullName() {
//         return this.title + ' ' + this.author;
//       }
//     }

//     const book = new Book();
//     book.author = 'Ravil';
//     book.title = 'Hello';

//     expect(book.getFullName()).toBe('Hello Ravil');

//     const printWithoutRegistrator = serberInstance.serialize(book);
//     expect(printWithoutRegistrator.author).toBe('Ravil');
//     expect(printWithoutRegistrator.title).toBe('Hello');
//     expect(printWithoutRegistrator.getFullName()).toBe('Hello Ravil');
//     // expect(classRegistrator.getPrototype(printWithoutRegistrator)).not.toBeDefined();

//     const registrator = new classRegistrator.Registrator();
//     registrator.register('Book', Book);

//     const printWithRegistrator = serberInstance.serialize(book, { [RegistratorSymbol]: registrator });
//     expect(printWithRegistrator.className).toBe('Book');
//     expect(printWithRegistrator.type).toBe(classRegistrator.PRINT_CLASS_TYPE);
//     expect(printWithRegistrator.instance).toEqual({ title: 'Hello', author: 'Ravil' });

//     const getNormalInstance = serberInstance.deserialize(printWithRegistrator, { [RegistratorSymbol]: registrator });
//     expect(getNormalInstance instanceof Book).toBeTruthy();
//     expect(getNormalInstance.getFullName()).toBe('Hello Ravil');

//     done();
//   });

//   test('отправка экземпляра через peer', async done => {
//     class Book {
//       public title: string = null;
//       public author: string = null;

//       public getFullName() {
//         return this.title + ' ' + this.author;
//       }
//     }

//     let book = new Book();
//     book.author = 'Ravil';
//     book.title = 'Hello';

//     const io = await prepareIO();

//     io.socketServerRfpPeer.registrator.register('Book', Book);
//     io.socketClientRfpPeer.registrator.register('Book', Book);

//     io.socketServerRfpPeer.receive('hey', ({ chunk }) => {
//       expect(chunk.body.getFullName()).toBe('Hello Ravil');
//       const book = chunk.body as Book;
//       book.author = 'Azat';
//       return book;
//     });

//     const response = await io.socketClientRfpPeer.send({ path: 'hey', body: book });
//     book = response.body;
//     expect(book.getFullName()).toBe('Hello Azat');

//     done();
//   });
// });
