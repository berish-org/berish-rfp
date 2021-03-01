import { getScope, StatefulObject } from '@berish/stateful';
import { getCommandName, PeerStoreCommandEnum } from './getCommandName';

export async function setStateRemote<T extends object>(store: StatefulObject<T>, state: Partial<T>): Promise<void> {
  const scope = getScope(store);

  if (scope.storeType === 'private') return void 0;

  try {
    const commandName = getCommandName(PeerStoreCommandEnum.setState, scope.storeType);
    scope.logger('setStateRemote').info(state);
    await scope.serviceChannel.send<Partial<T>, boolean>(commandName, state, { isBlocker: true });
  } catch (err) {
    scope.logger('setStateRemote').error(err);
  }
}
