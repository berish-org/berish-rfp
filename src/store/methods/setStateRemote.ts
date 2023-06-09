import { getScope, StatefulObject } from '@berish/stateful';
import { getCommandName, PeerStoreCommandEnum } from './getCommandName';

export async function setStateRemote<T extends object>(store: StatefulObject<T>, state: Partial<T>): Promise<void> {
  const scope = getScope(store);

  if (scope.storeType === 'private') return void 0;

  try {
    const commandName = getCommandName(PeerStoreCommandEnum.setState, scope.storeName);
    scope.logger('setStateRemote').info(state);
    await scope.peer.serviceChannel.send<Partial<T>, boolean>('store', commandName, state, { isBlocker: true });
  } catch (err) {
    scope.logger('setStateRemote').error(err);
  }
}
