import type { ISerberPlugin } from '@berish/serber';
import type { PeerRequest } from '../../peer';

import { PeerDecorator, isPeerDecorator } from './peerDecorator';

/**
 * Параметр, который указывает PeerRequest
 */
export const SYMBOL_SERBER_REQUEST = Symbol('serberRequest');

export interface PeerDecoratorToResultPluginOptions {
  [SYMBOL_SERBER_REQUEST]?: PeerRequest;
}

export const peerDecoratorToResultPlugin: ISerberPlugin<PeerDecorator<any>, any, PeerDecoratorToResultPluginOptions> = {
  isForSerialize: (obj) => isPeerDecorator(obj),
  isForDeserialize: () => false,
  isAlreadyDeserialized: (obj) => peerDecoratorToResultPlugin.isForSerialize(obj as PeerDecorator<any>),
  serialize: (obj, params) => (params[SYMBOL_SERBER_REQUEST] ? obj.call(params[SYMBOL_SERBER_REQUEST]) : undefined),
  serializeAsync: (obj, params) => peerDecoratorToResultPlugin.serialize(obj, params),
};
