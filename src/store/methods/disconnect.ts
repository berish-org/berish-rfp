import { getPrivateScope, getScope, StatefulObject } from '@berish/stateful';

export function disconnect<T extends object>(store: StatefulObject<T>) {
  const scope = getScope(store);
  const privateScope = getPrivateScope(store);

  if (scope.isConnected) {
    if (privateScope.listenId) {
      scope.unlistenChange(privateScope.listenId);
      privateScope.listenId = undefined;
    }

    if (privateScope.unreceiveSetValue) {
      privateScope.unreceiveSetValue();
      privateScope.unreceiveSetValue = undefined;
    }

    if (privateScope.unreceiveSetState) {
      privateScope.unreceiveSetState();
      privateScope.unreceiveSetState = undefined;
    }

    if (privateScope.remoteChanges) {
      privateScope.remoteChanges = undefined;
    }

    scope.isConnected = false;
    scope.logger.info('disconnectedd');
  }
}
