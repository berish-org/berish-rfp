import { StatefulObject, getScope, getPrivateScope, listenChange } from '@berish/stateful';

import { StoreScopeNotFoundError } from '../../errors';

import { sync } from './sync';
import { reactionSetStateRemote } from './reactionSetStateRemote';
import { reactionSetValueRemote } from './reactionSetValueRemote';
import { removeRemoteChange } from './removeRemoteChange';

export async function connect<T extends object>(store: StatefulObject<T>) {
  const scope = getScope(store);
  const privateScope = getPrivateScope(store);

  if (!scope) throw new StoreScopeNotFoundError();

  if (!scope.isConnected) {
    privateScope.remoteChanges = [];

    // Слушаем локальные изменения
    privateScope.listenId = listenChange(store, async (props, oldValue, newValue) => {
      const isExists = removeRemoteChange(store, props, newValue);

      if (scope.setValueRemote && !isExists) {
        await scope.setValueRemote(props, newValue);
      }
    });

    // Слушаем удаленные изменения (setValue)
    privateScope.unreceiveSetValue = reactionSetValueRemote(store, (props, value) => {
      privateScope.remoteChanges.push([props, value]);
      scope.setValue(props, value);
    });

    // Слушаем удаленные изменения (setState)
    privateScope.unreceiveSetState = reactionSetStateRemote(store, (state) => scope.setState(state));

    scope.isConnected = true;

    scope.logger.info('connected');

    await sync(store);
  }
}
