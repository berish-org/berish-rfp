import { getScope, StatefulObject } from '@berish/stateful';
import type { PeerStoreSetValueData } from './setValueRemote';

import { getCommandName, PeerStoreCommandEnum } from './getCommandName';
import { StoreScopeNotFoundError } from '../../errors';

export function reactionSetValueRemote<T extends object>(store: StatefulObject<T>, callback) {
  const scope = getScope(store);
  if (!scope) throw new StoreScopeNotFoundError();

  const commandName = getCommandName(PeerStoreCommandEnum.setValue, scope.storeType);

  const receiveHash = scope.serviceChannel.receive<PeerStoreSetValueData>(commandName, ({ serviceData }) => {
    scope.logger('reactionSetValueRemote').info(serviceData);
    const { props, value } = serviceData;
    callback(props, value);
  });

  return () => {
    scope.serviceChannel.unreceive(receiveHash);
  };
}
