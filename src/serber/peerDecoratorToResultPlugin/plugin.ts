import type { ISerberPlugin } from '@berish/serber';
import { convertDataToSend, Peer, PeerRequest } from '../../peer';
import { SYMBOL_SERBER_PEER } from '../abstract';
import {
  DeferredReceiveList,
  SYMBOL_SERBER_CHUNK_REPLY_PATH,
  SYMBOL_SERBER_DEFERRED_LIST,
} from '../functionToFunctionPrintPlugin';

import { PeerDecorator } from './peerDecorator';

/**
 * Параметр, который указывает PeerRequest
 */
export const SYMBOL_SERBER_REQUEST = Symbol('serberRequest');

export interface PeerDecoratorToResultPluginOptions {
  [SYMBOL_SERBER_PEER]: Peer;
  [SYMBOL_SERBER_DEFERRED_LIST]?: DeferredReceiveList;
  [SYMBOL_SERBER_CHUNK_REPLY_PATH]?: string;
  [SYMBOL_SERBER_REQUEST]?: PeerRequest;
}

export const peerDecoratorToResultPlugin: ISerberPlugin<PeerDecorator<any>, any, PeerDecoratorToResultPluginOptions> = {
  isForSerialize: (obj) => obj && PeerDecorator.is(obj),
  isForDeserialize: () => false,
  isAlreadyDeserialized: (obj) => peerDecoratorToResultPlugin.isForSerialize(obj as PeerDecorator<any>),
  serializeAsync: async (obj, params) => {
    const peer = params[SYMBOL_SERBER_PEER];
    const defferedList = params[SYMBOL_SERBER_DEFERRED_LIST];
    const incomeRequest = params[SYMBOL_SERBER_REQUEST];

    if (!incomeRequest) return undefined;

    const result = await PeerDecorator.execute(obj, incomeRequest);
    return convertDataToSend(peer, result, defferedList, incomeRequest);
  },
};
