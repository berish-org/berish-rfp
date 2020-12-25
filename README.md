# @berish/stateful

Бинарный безопасный протокол организации транспорта для взаимодействия пиров с помощью отпечатков функций.

Является только уровнем организации транспорта (не является транспортом самостоятельно!).

**Старая версия** находится в npm как `fartix-rfp`

## Installation

```
$ npm install @berish/rfp --save
```

or

```
$ yarn add @berish/rfp
```

**Supports typescript**

## Инициализация

Нужно создать подключение с помощью socket.io (смотреть документацию к socketIO)

После настройки сокета мы можем инициализировать **RfpPeer** для дальнейшей работы

```typescript
const socketClientPeer = SocketIOClient.connect(socketServerAddress,{ transports: ['websocket'] });
const socketClientRfpPeer = new RfpPeer().setSocket(socketClientPeer));
socketClientPeer.on('connect', () => {
  socketClientRfpPeer.open();
})
socketClientPeer.on('disconnect', () => {
  socketClientRfpPeer.close();
})
```

Все! **RfpPeer** готов к работе. Пример выше показан для использования **RfpPeer** на стороне клиента, для сервера практически все аналогично

```typescript
const httpServer = http.createServer().listen();
const httpServerAddress = httpServer.address() as AddressInfo;
const socketServer = SocketIO(httpServer);

socketServer.on('connection', (socket) => {
  const socketServerRfpPeer = new RfpPeer().setSocket(socket);
});
```

## Настройка

### Настройка транспорта

Можно удобно настраивать транспорт на лету.

```typescript
const peer = new RfpPeer();
peer.setSocket(socket: SocketIO.Client | SocketIO-Client.Socket);
```

### Настройка уровня использования

```typescript
peer.setSerberLevel(level: 'raw' | 'production')
```

Serber является реализацией библиотеки **berish-serber**. Служит для удобной сериализации и десериализации объектов. В случае установки значения в **raw**, **RfpPeer** будет общаться в сырых данных, которые получаются при обычной сериализации. Если стоит значение **production**, **RfpPeer** будет реализовывать умную поддержку функций и отпечатков функций.

По умолчанию стоит значение **production**.

### Настройка общего хранилища

```typescript
peer.setStore<StoreState>(store: RfpStore<StoreState>)
```

Хранилище организовано с помощью реализации библиотеки **berish-stober**. Данная библиотека позволяет использовать любой адаптер хранилища, в том числе **redux**. Позволяет записывать данные в любой тип хранилища, например **localStorage**, после того, как будет описан адаптер типа хранилища **storageAdapter** (смотреть **berish-stober**).

```typescript
const store = new Stober.DynamicStore<IState>(redux.createStore, []);
const rfpStore = new RfpStore().setStoreAdapter(store);

const rfpPeer = new RfpPeer().setSocket(socket).setStore(rfpStore);
```

## Взаимодействие

### Контроль соединения

Можно вручную открывать и закрывать контроль соединение (но не соединение транспорта)

```typescript
rfpPeer.open();
console.log(rfpPeer.isOpened);
rfpPeer.close();
```

По-умолчанию, при настройки транспорта автоматически открывается соединение прослушки транспорта для контроля **RfpPeer**.

### Сообщения

Клиент и сервер общаются посредством **RfpChunk**. Это является транспортной бизнес-сущностью, которая передает всю информацию между пирами.

```typescript
export type RfpResponseStatusType = 'resolve' | 'reject' | 'initial';

export interface IRfpChunkStore<StoreState> {
  /** Ссылка на store внутри peer */
  store?: RfpStore<StoreState>;
}

export interface IRfpChunkSend<Body> {
  /** Показывает путь, на который направлен текущий chunk */
  readonly path: string;
  /** Основная информация, которую передает chunk */
  readonly body?: Body;
}

export interface IRfpChunkId {
  /** Показывает идентификатор текущего chunk */
  chunkId?: string;
  /** Показывает на какой chunk указывает текущий chunk */
  replyId?: string;
  /** Показывает запрос выполнен со статусом resolve или reject */
  status?: RfpResponseStatusType;
}

export interface IRfpChunk<Body, StoreState = any>
  extends IRfpChunkSend<Body>,
    IRfpChunkId,
    IRfpChunkStore<StoreState> {
  /** Дополнительная информация, которую можно получить из chunk */
  aside?: { [key: string]: any };
}
```

### Отправка данных

Чтобы отправить данные через **rfp**, необходимо вызвать метод **send**.

```typescript
const response = await socketClientRfpPeer.send({ body: 'hello world', path: 'hey' });
```

В данном случае клиент отправляет **chunk** по пути **_‘hey’_** данные **_‘hello world’_**

Поле **path** является обязательным условием, но сами данные не являются обязательными, так как серверный **peer** имеет возможность не смотря на **body** отправить свой ответ.

**Пример**

```typescript
const lib = await socketClientRfpPeer.send({ path: ‘getLib’ });

// lib теперь имеет отпечатки функций сервера, где может вызывать функции библиотеки, которую ранее он получил
```

Формат отправки **chunk**

```typescript
export interface IRfpChunkSend {
	body: any // любые данные
	path: string // адрес, на который отправляется chunk,
	chunkId: string // идентификатор текущего chunk, если не указывать, значение является уникальным
	replyId: string // идентификатор chunk, на который направлен текущий chunk. В случае нахождение chunkId в базе прослушки, отвечает на chunk для которого он показывает
	aside: {[key: string]: any} // дополнительная информация, которую можно отправить вместе с основной информацией (например, userToken)
	status: ‘resolve’ | ‘reject’ | ‘initial’ // показывает, является ли это самостоятельным chunk (initial), либо отвечает на другой chunk в сети (resolve - успешно, reject - ошибка)
}
```

### Получение данных

Мы можем слушать любой **chunk** по пути **path**, после чего сработает **callback**, в который передаются 2 аргумента: **request**, **next**.

```typescript
interface IRfpRequest<StoreState = any> {
  chunk: IRfpChunk<any, StoreState>;
  peer: RfpPeer<StoreState>;
}

export type IRfpNextResponse = () => void;
```

**Пример**

```typescript
socketServerRfpPeer.receive(‘auth’, (request, next) => {
	if(request.chunk.body.login !== ‘admin’ && request.chunk.body.pass !== ‘123456’ )
		throw new Error(‘permission denied’);
	return ‘access’;
});
```

Клиент в свою очередь получит ответ

```typescript
const response: IRfpChunk & IRfpReplyChunk = await socketClientRfpPeer.send({ body: { login: ‘admin’, pass: ‘123456’ }, path: ‘auth’ });

console.log(response.body) // access;
console.log(response.replyChunk.body) // { body: { login: ‘admin’, pass: ‘123456’ };
```

## Отпечатки функций

Библиотека умеет эмулировать функции, которые вы можете передать с сервера на клиент и обратно. То есть теперь Вы можете отправлять не обычные текстовые данные (json), а полноценные переменные, объекты и функции.

Когда один пир отправляет другому пиру функцию или объект, в котором есть функция, эти функции преобразовываются в отпечатки функций. То есть это есть реальные функции, которые Вы в будущем сможете вызвать на клиенте. В этот момент произойдет запрос на сервер и вызовется настоящая функция, на которую и смотрит вызванный отпечаток этой функции. Вам не надо заботится о взаимодействии, библиотека это сделает за вас. Так ваши функции могут отправлять сами функции и объекты с функциями, они также будут автоматически преобразовываться в отпечатки функций. Стоит учитывать, если у вас на сервере функции являются синхронными, они преобразовываются в асинхронные (для клиента), для лучшей производительности JS движка. Вы можете отправлять функции с любого пира, все превращение сделает библиотека.

**Пример**

```typescript
const socketServerRfpPeer = new RfpPeer()
	.setSocket(socketServerPeer);
const socketClientRfpPeer = new RfpPeer()
	.setSocket(socketClientPeer);

const sumFunc = (a: number, b: number) => a + b;

socketServerRfpPeer.receive(‘getSum’, (req, next) => {
	return sumFunc;
});

const lib = await socketClientRfpPeer.send({ path: ‘getSum’ });

const a = 13;
const b = 17;
const sum = await lib.body(a, b); // body - в данном случае будет отпечатком функции sumFunc
console.log(sum === sumFunc(a, b)) // 30 === 30
```

Поддерживается многоуровневая передача функций. Например, вложенность второго уровня

```typescript
const socketServerRfpPeer = new RfpPeer().setSocket(socketServerPeer);
const socketClientRfpPeer = new RfpPeer().setSocket(socketClientPeer);

const libServer = {
  minus: (a, b) => a - b,
  sum: (a, b) => a + b,
};
socketServerRfpPeer.receive('hey', (req, next) => {
  return libServer;
});

const response = await socketClientRfpPeer.send({ path: 'hey' });
const libClient = response.body;

const a = 54;
const b = 32;
const sum = await libClient.sum(a, b);
const minus = await libClient.minus(a, b);
console.log(sum === libServer.sum(a, b)); // 86 === 86
console.log(minus === libServer.minus(a, b)); // 22 === 22
```

### Бэкенд как библиотека

Теперь Вы можете описывать свой бэкенд как библиотеку, не задумываясь о путях, и настройки роутингов для старого **REST** и о прочих трудностях. Вам только необходимо будет написать красивый бэкенд, не заботясь обо всех побочных задачах, которая вызывала ранее разработка бэкенда

```typescript
const socketServerRfpPeer = new RfpPeer().setSocket(socketServerPeer);
const socketClientRfpPeer = new RfpPeer().setSocket(socketClientPeer);

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
socketServerRfpPeer.receive('hey', (req, next) => {
  return libServer;
});

const libClient = await socketClientRfpPeer.send({ path: 'hey' });

const firstName = faker.name.title();
const idBook1 = await libClient.body.book.create(firstName);
let bookName = await libClient.body.book.read(idBook1);
console.log(bookName === firstName); // true

const secondName = faker.name.title();
await libClient.body.book.update(idBook1, secondName);
bookName = await libClient.body.book.read(idBook1);
console.log(bookName !== firstName); // true
console.log(bookName === secondName); // true

await libClient.body.book.delete(idBook1);
const bookName2 = await libClient.body.book.read(idBook1);
console.log(!!bookName2); // true
```

### Взаимодействие между клиентами

Вы можете отправлять переменные, объекты, функции и всю прочую информацию между клиентами, не заботясь о настройках транспорта.

То есть, есть 2 клиента и 1 сервер. Вы можете перенаправлять информацию между клиентами через сервер, и все будет прекрасно работать. Если Вы хотите, чтобы общение происходило только через клиентов, без взаимодействия с сервером, вам необходимо настроить транспорт для P2P соединений, например, **socket.io P2P** или TCP (UDP) соединение (напомним, для **socket.io P2P** адаптер у нас уже готов, Вам необходимо только внести правки в режим транспорта socket.io, смотрите соответствующую документацию у них на сайте).

```typescript
const socketServerRfpPeer1 = new RfpPeer().setSocket(socketServerPeer1); // в данном случае это сокет, направленный на первого пира
const socketServerRfpPeer2 = new RfpPeer().setSocket(socketServerPeer2);// в данном случае это сокет, направленный на второго пира
const socketClientRfpPeer1 = new RfpPeer().setSocket(socketClientPeer1);
const socketClientRfpPeer2 = new RfpPeer().setSocket(socketClientPeer2);

socketServerRfpPeer1.receive('hey', async ({ chunk }, next) => {
	const response = await socketServerRfpPeer2.send({ path: ‘hey’, body: chunk.body })
	return response;
});
const lib = await socketClientRfpPeer1.send({
	body: (data: string) => data && data.toLocaleUpperCase(),
	path: 'hey',
});
const responseFromClientPeer2 = await lib.body('hello');
```

### Взаимодействия с функциями внутри классов

Можно отправлять функции, которые находятся внутри какого-либо класса. Контекст слова **this** сохранится. Следует учитывать, что сам класс как класс передать не получится, отправится лишь объект представляющий данный класс, и ключевое слово **this** потеряет свой смысл если Вы завязаны на прототипе. Но если Вы хотите просто передать класс, не для работы с ним напрямую, а для вызова функций внутри этого класса, тогда все будет работать как надо.

Мы работает над тем, чтобы была какая-либо возможность передавать классы с прототипом в будущем напрямую.

## Хранилище

Можно удобно хранить и использовать данные в общем хранилище. Так, Вы можете хранить **_user token_** пользователя и в любой момент забирать его на сервере для своих проверок.

Хранилище использует реализацию библиотеки **berish-stober** (npm).

```typescript
const storeClient = new stober.DynamicStore<IState>(createStore, []);
const socketClientRfpStore = new RfpStore().setStoreAdapter(storeClient);

const socketClientRfpPeer = new RfpPeer().setSocket(socketClientPeer).setStore(socketClientRfpStore);
```

Вы можете использовать методы **RfpStore** для своих нужд.

```typescript
rfpStore.open(); // принудительное включение прослушки store
rfpStore.close(); // принудительная остановка прослушки store
rfpStore.isOpened; // прослушивается ли текущий store

rfpStore.state; // текущее состояние хранилище
rfpStore.setState(state); // задать текущий rfp.state по ключам из входящего state (как в react) и обновление на обеих сторонах
rfpStore.forceUpdate(); // принудительное обновление хранилище на обеих сторонах
rfpStore.setStateLocal(state); // похоже на setState, но не отправляет state на другой пир

rfpStore.get(key); // работа с полями через getter
rfpStore.set(key, value); // работа с полями через setter
```

**Пример**

```typescript
interface IState {
	login: string;
}

const storeServer = new DynamicStore<IState>(createStore, []);
const storeClient = new DynamicStore<IState>(createStore, []);

const socketServerRfpStore = new RfpStore()
	.setStoreAdapter(storeServer);
const socketClientRfpStore = new RfpStore()
	.setStoreAdapter(storeClient);

const socketServerRfpPeer = new RfpPeer()
	.setSocket(socketServerPeer)
	.setStore(socketServerRfpStore);

const socketClientRfpPeer = new RfpPeer()
	.setSocket(socketClientPeer)
	.setStore(socketClientRfpStore);

socketClientRfpPeer.receive('hey', async ({ chunk }, next) => {
	const state = chunk.store.state;
	console.log(state) // {}
	console.log(chunk.body) // {login: ‘admin’}
	await chunk.store.setState(chunk.body);
	return 'ok';
});

const status = await socketServerRfpPeer.send({ path: 'hey', body: { login: ‘admin’ } });

console.log(status.body) // ok
console.log(socketServerRfpPeer.store.state) // { login: ‘admin’ }
```

## Middleware и Receivers. Цепочка выполнения запроса

Вы можете писать свои **middleware** или подключать сторонние. В них Вы можете описывать действия, которые необходимо совершить перед каждый получением данных на стороне одного из пира. **Middleware** получает на вход такой же **request** и **next** как и обычный **receiver**. Чтобы ответить на **middleware** необходимо вызвать метод **next**.

Если Вы ответите **throw err** или **return data**, Вы завершите цикл запроса и далее запрос не пойдет по цепочке, вместо этого пойдет ответный запрос на пир, который ожидает ответ. Если вы ответите **next(),** цепочка продолжится и будет вызываться другой middleware, если такой есть.

Если таковой отсутствует, запрос начнется по цепочке **receivers** на пути, которые были указаны в оригинальном **chunk**. Там также доступны 3 варианта ответа, которые работают аналогично, кроме **next()**. Метод **next** будет далее срабатывать по цепочке **receivers** с нужным **path** пока не будет получен ответ.

Если ответ никто так и не сформировал (отсутствуют middleware или все дали ответ **next()**, и отсутствуют **receivers** по нужному пути или все дали ответ **next()**) будет автоматически дан ответ **reject** с сообщением **'_path is not found_'**.

**Пример**

```typescript
const socketServerRfpPeer = new RfpPeer().setSocket(socketServerPeer);
const socketClientRfpPeer = new RfpPeer().setSocket(socketClientPeer);

const authMiddle: RfpMiddlewareReceive<any> = ({ chunk, peer }, { reject, next }) => {
  if (chunk.body.login === 'admin') return next();
  throw new Error('its not admin');
};
socketServerRfpPeer.middleware(authMiddle);

socketServerRfpPeer.receive('hey', ({ chunk }, next) => {
  if (chunk.body.password === '123456') return 'resolve by 1';
  if (chunk.body.password === '1234567') return throw new Error('reject by 1');
  return next();
});

socketServerRfpPeer.receive('hey', ({ chunk }, next) => {
  if (chunk.body.password === '123123') return 'resolve by 2';
  throw new Error('reject by 2');
});

// Примеры цепочки запросов

// Срабатывание middleware c ответом resolve
try {
  const test = await socketClientRfpPeer.send({ path: 'hey', body: { login: 'admin2' } });
} catch (err) {
  console.log(err); // its not admin
}

// Срабатывание второго receiver с ответом reject
try {
  const test = await socketClientRfpPeer.send({ path: 'hey', body: { login: 'admin' } });
} catch (err) {
  console.log(err); //reject by 2
}

// Срабатывание первого receiver с ответом reject
try {
  const test = await socketClientRfpPeer.send({ body: { login: 'admin', password: '1234567' }, path: 'hey' });
} catch (err) {
  console.log(err); //reject by 1
}

// Срабатывание первого receiver с ответом resolve
const test = await socketClientRfpPeer.send({ body: { login: 'admin', password: '123456' }, path: 'hey' });
console.log(test.body); //resolve by 1

// Срабатывание второго receiver с ответом resolve
const test = await socketClientRfpPeer.send({ body: { login: 'admin', password: '123123' }, path: 'hey' });
console.log(test.body); //resolve by 2
```

## Контекст выполнения

Все хорошо, когда Вы напрямую ожидаете вызова через **receivers**, там Вы можете получить **request** напрямую, откуда можете считать любую информацию, например **body** или **aside**. Но что делать, когда Вы передали отпечаток функции и ожидаете вызова напрямую в функции? Изначально, в отпечаток функции не приходит **request**, потому что передача невозможно (ведь аргументы заняты Вами). В таком случае на помощь приходит небольшая магия.

### Получение контекста

Например, Вы получили функции **sum** от сервера, которая просто суммирует 2 числа

```typescript
sum(a: number, b: number) {
	return a + b;
}
```

Но что, если Вам надо проверить какое либо условие, например, может ли текущий пользователь суммировать числа, или выдать ему ошибка, что у Вас недостаточно прав.

```typescript
sum(a: number, b: number) {
	if(chunk.store.state.userToken === undefined) throw new Error(‘permission denied’)
	return a + b;
}
```

Но где же нам взять входящий **chunk** внутри функции? Для этого нужно прописать еще один аргумент, в который и будет передавать текущий **request**.

**_ОБЯЗАТЕЛЬНО_**: аргумент должен называться **rfp** и должен располагаться в конце всех аргументов; если аргумент будет назван по-другому, будет находиться не последним, либо не объявлен вообще, **request** передан не будет!

```typescript
sum(a: number, b: number, rfp?: IRfpChunk) {
	const {chunk, peer} = rfp;
	if(chunk.store.state.userToken === undefined) throw new Error(‘permission denied’)
	return a + b;
}
```

Теперь магическим способом, мы получим request через аргумент rfp. Даже если Вы ожидаете любое количество аргументов, мы, если встретим среди них rfp, передадим Вам request.

Но что делать, если Вы ожидаете 2 аргумента, и второй из них может быть Вами не передан самостоятельно, например **sum(3)**, когда **sum(a: number, b?: number, rfp?: IRfpChunk)**. Тогда мы просто не передадим Вам этот второй аргумент, но rfp Вы получите в любом случае.

Если Вы хотите передать контекст временно (через **aside**), вы также его сможете легко получить (о том, как передавать контекст, читайте далее).

```typescript
sum(a: number, b: number, rfp?: IRfpChunk) {
	const contextData = context.getContextAside(rfp);
	if(contextData === undefined) throw new Error(‘permission denied’)
	return a + b;
}
```

### Передача контекста

Если Вы хотите при вызове функции через ее отпечаток передать дополнительный контекст, Вы можете воспользоваться функцией высшего порядка

```typescript
context.setContextAside(func, contextData);
```

Пример по отпечатку функции **sum** из прошлого примера

```typescript
const contextData = ‘123123’;
const sumWithContext = context.setContextAside(libClient.body.sum, contextData);

const sum = await sumWithContext(3, 4);
console.log(sum) // 7

const sumThrown = libClient.body.sum(3, 4) // thrown ‘permission denied’ (если вызывать без контекста функцию из прошлого примера)
```
