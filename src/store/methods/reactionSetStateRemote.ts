import { getScope, StatefulObject } from '@berish/stateful';
import { getCommandName, PeerStoreCommandEnum } from './getCommandName';

export type ReactionSetStateRemoteCallback<T> = (state: Partial<T>) => void | Promise<void>;

export function reactionSetStateRemote<T extends object>(
  store: StatefulObject<T>,
  callback: ReactionSetStateRemoteCallback<T>,
) {
  const scope = getScope(store);

  if (!scope) throw new TypeError('PeerStore scope is not found');
  if (!callback) throw new TypeError('PeerStore callback is null');

  const commandName = getCommandName(PeerStoreCommandEnum.setState, scope.storeName);
  const receiveHash = scope.peer.serviceChannel.receive<Partial<T>>('store', commandName, async ({ serviceData }) => {
    scope.logger('reactionSetStateRemote').info(serviceData);
    await callback(serviceData);
  });

  return () => {
    scope.peer.serviceChannel.unreceive(receiveHash);
  };
}
