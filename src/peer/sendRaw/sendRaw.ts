import type { Peer } from '../peer';
import { fillChunk, PeerChunk } from '../../chunk';

import { deferredReceiveStart } from '../../serber';

import { createRequest } from '../request';
import { waitResponse } from './waitResponse';
import { ConnectionError, PeerDecoratorException } from '../../errors';
import { checkConnection } from './checkConnection';
import { convertStep } from './convertStep';
import { blockStep } from './blockStep';
import { unblockStep } from './unblockStep';
import { sendReject } from '../send/sendReject';

export async function sendRaw<Resolve = any, Data = any>(
  peer: Peer,
  outcomeChunk: PeerChunk<Data>,
  incomeChunk?: PeerChunk<any>,
) {
  // Проверка
  if (!peer) throw new TypeError('send Peer is null');
  if (!outcomeChunk) throw new TypeError('send outcomeChunk is null');
  if (!checkConnection(peer, outcomeChunk)) return void 0;

  // Заполнение данных
  outcomeChunk = outcomeChunk && fillChunk(outcomeChunk);
  incomeChunk = incomeChunk && fillChunk(incomeChunk);

  const outcomeRequest = outcomeChunk && createRequest(peer, outcomeChunk);
  const incomeRequest = incomeChunk && createRequest(peer, incomeChunk);

  // Решение всех блокирующих запросов
  await blockStep(peer, outcomeChunk);

  try {
    const { outcomeRequestConverted, deferredList } = await convertStep(outcomeRequest, incomeRequest);
    // Конвертация данных

    // Вызов отложенных команд
    deferredReceiveStart(deferredList);

    if (!checkConnection(peer, outcomeChunk)) return void 0;

    // Транспортная отправка данных
    const sended = await peer.connection.transport.send(peer, outcomeRequestConverted.chunk);

    if (!sended) throw new ConnectionError('send is not executed');

    // Если не нужен ответ, то прерываем
    if (outcomeChunk.notWaiting) {
      peer.logger('send')('not wait').info(outcomeChunk.chunkId);
      return void 0;
    }

    peer.logger('send')('wait').info(outcomeChunk.chunkId);

    const result = await waitResponse<Resolve, Data>(peer, outcomeChunk);

    // Разблокируем запросы
    await unblockStep(peer, outcomeChunk);

    return result;
  } catch (err) {
    if (
      (outcomeChunk.status === 'resolve' || outcomeChunk.status === 'reject') &&
      incomeChunk &&
      typeof err === 'object' &&
      err instanceof PeerDecoratorException
    ) {
      return sendReject(peer, err, incomeChunk);
    }
    throw err;
  }
}
