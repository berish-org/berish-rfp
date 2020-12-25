import { RfpPeer } from '../peer';
import { RfpPull } from './pull';
import { ServiceChannel } from './serviceChannel';
import { generateError, ErrorTypeEnum } from '../errors';

const serviceCommands = { connect: 'connect' };
const serviceModuleName = 'proxy';

class ProxyClient {
  private _serviceChannel: ServiceChannel = null;

  constructor(serviceChannel: ServiceChannel) {
    this._serviceChannel = serviceChannel;
  }
  public async connect(phrase: string) {
    const response = await this._serviceChannel.send<string, boolean>(serviceCommands.connect, phrase);
    if (!response.data) throw generateError(ErrorTypeEnum.PROXY_CONNECTION_DATA_CONFUSED);
  }
}

class ProxyServer {
  private _phrase: string = null;
  private _serviceChannel: ServiceChannel = null;

  constructor(serviceChannel: ServiceChannel) {
    this._serviceChannel = serviceChannel;
  }

  public start(pharse: string) {
    this._phrase = pharse;
    return this._serviceChannel.receive<string>(serviceCommands.connect, async ({ chunk, peer, serviceData }) => {
      if (this._phrase !== serviceData) throw new Error('Phrase is not correct');
      peer
        .getLogger()(serviceModuleName)('start')
        .info(serviceData);
      // await this.reconnectAll(peer.pull);
      return true;
    });
  }

  public async reconnectAll(pull: RfpPull) {
    if (!pull) throw new Error('peer.pull is not defined. Use RfpPull on Server');
    const clients = pull.peers.filter(m => !(m.publicStore && m.publicStore['isDevServer'] === true));
    await Promise.all(clients.map(m => m.send({ path: 'reconnect force', notWaiting: true })));
  }
}

/**
 * Настоящий сервер должен по умолчанию знать о командах для прокси и уметь принять на себя прокси соединение
 * Проксируемый сервер должен уметь подключаться к настоящему серверу по мере необходимости по специальной фразе
 * Клиенты подключаются сначала к настоящему серверу, после чего, можно подключиться к проксируемому серверу по специальной фразе
 * 1 фраза - 1 проксируемый сервер.
 * Много клиентов - на 1 настоящий сервер - много проксируемых серверов.
 * Если клиент не использует никаких фраз, он подключается к настоящему серверу, кроме случаев если проксируемый сервер
 */
export class Proxy {
  public client: ProxyClient = null;
  public server: ProxyServer = null;

  private _serviceChannel: ServiceChannel = ServiceChannel.getServiceChannel(serviceModuleName);

  constructor(currentPeer: RfpPeer) {
    this._serviceChannel = this._serviceChannel.setPeer(currentPeer);
    this.client = new ProxyClient(this._serviceChannel);
    this.server = new ProxyServer(this._serviceChannel);
  }
}
