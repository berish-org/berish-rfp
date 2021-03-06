import { ConnectionError, PeerDecoratorException } from '../../errors';
import { DeferredReceiveList, deferredReceiveStart } from '../../serber';

import { convertToSend } from '../convert';
import { PeerRequest } from '../receiveType';

export async function convertStep<Resolve = any, Data = any>(outcomeRequest: PeerRequest, incomeRequest?: PeerRequest) {
  try {
    const deferredList: DeferredReceiveList = {};

    const outcomeRequestConverted = await convertToSend(outcomeRequest, deferredList, incomeRequest);

    return { deferredList, outcomeRequestConverted };
  } catch (err) {
    throw new ConnectionError('send can`t convert data');
  }
}
