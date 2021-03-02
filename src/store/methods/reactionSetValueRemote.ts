import { getScope, StatefulObject } from '@berish/stateful';
import type { PeerStoreSetValueData } from './setValueRemote';

import { getCommandName, PeerStoreCommandEnum } from './getCommandName';

export function reactionSetValueRemote<T extends object>(store: StatefulObject<T>, callback) {
  const scope = getScope(store);
  if (!scope) throw new TypeError('PeerStore scope is not found');

  const commandName = getCommandName(PeerStoreCommandEnum.setValue, scope.storeName);

  const receiveHash = scope.peer.serviceChannel.receive<PeerStoreSetValueData>(
    'store',
    commandName,
    ({ serviceData }) => {
      scope.logger('reactionSetValueRemote').info(serviceData);
      const { props, value } = serviceData;
      callback(props, value);
    },
  );

  return () => {
    scope.peer.serviceChannel.unreceive(receiveHash);
  };
}
