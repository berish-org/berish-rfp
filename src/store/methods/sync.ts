import { getScope, StatefulObject } from '@berish/stateful';
import { StoreIsDisconnectedError, StorePeerNotFoundError, StoreScopeNotFoundError } from '../../errors';

export async function sync<T extends object>(store: StatefulObject<T>) {
  const scope = getScope(store);

  if (!scope) throw new StoreScopeNotFoundError();
  if (!scope.isConnected) throw new StoreIsDisconnectedError();
  if (!scope.peer) throw new StorePeerNotFoundError();

  if (Object.keys(scope.target).length > 0) {
    scope.logger.info('sync started');

    await scope.setStateRemote(scope.target);

    scope.logger.info('sync finished');
  }
}
