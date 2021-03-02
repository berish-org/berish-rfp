import { getScope, StatefulObject } from '@berish/stateful';
import { StoreScopeNotFoundError } from '../../errors';
import { getCommandName, PeerStoreCommandEnum } from './getCommandName';

export type ReactionSetStateRemoteCallback<T> = (state: Partial<T>) => void;

export function reactionSetStateRemote<T extends object>(
  store: StatefulObject<T>,
  callback: ReactionSetStateRemoteCallback<T>,
) {
  const scope = getScope(store);

  if (!scope) throw new StoreScopeNotFoundError();
  if (!callback) throw new TypeError('PeerStore callback is null');

  const commandName = getCommandName(PeerStoreCommandEnum.setState, scope.storeName);
  const receiveHash = scope.serviceChannel.receive<Partial<T>>(commandName, ({ serviceData }) => {
    scope.logger('reactionSetStateRemote').info(serviceData);
    callback(serviceData);
  });

  return () => {
    scope.serviceChannel.unreceive(receiveHash);
  };
}
