import { getScope, StatefulObject } from '@berish/stateful';
import { ConnectionError } from '../../errors';

export async function sync<T extends object>(store: StatefulObject<T>) {
  const scope = getScope(store);

  if (!scope) throw new TypeError('PeerStore scope is not found');
  if (!scope.isConnected) throw new ConnectionError('Peer store is disconnected');
  if (!scope.peer) throw new TypeError('PeerStore peer is null');

  if (Object.keys(scope.target).length > 0) {
    scope.logger.info('sync started');

    await scope.setStateRemote(scope.target);

    scope.logger.info('sync finished');
  }
}
