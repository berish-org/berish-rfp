import type { ISerberPlugin } from '@berish/serber';
import type { PeerRequest } from '../../peer';

import { PeerDecorator } from './peerDecorator';

/**
 * Параметр, который указывает PeerRequest
 */
export const SYMBOL_SERBER_REQUEST = Symbol('serberRequest');

export interface PeerDecoratorToResultPluginOptions {
  [SYMBOL_SERBER_REQUEST]?: PeerRequest;
}

export const peerDecoratorToResultPlugin: ISerberPlugin<PeerDecorator<any>, any, PeerDecoratorToResultPluginOptions> = {
  isForSerialize: (obj) => obj && PeerDecorator.is(obj),
  isForDeserialize: () => false,
  isAlreadyDeserialized: (obj) => peerDecoratorToResultPlugin.isForSerialize(obj as PeerDecorator<any>),
  serializeAsync: async (obj, params) => {
    if (!params[SYMBOL_SERBER_REQUEST]) return undefined;

    const result = await PeerDecorator.execute(obj, params[SYMBOL_SERBER_REQUEST]);
    return result;
  },
};
