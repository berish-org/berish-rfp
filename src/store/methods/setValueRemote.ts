import { getScope, StatefulObject } from '@berish/stateful';
import { getCommandName, PeerStoreCommandEnum } from './getCommandName';

export interface PeerStoreSetValueData {
  props: (string | number | symbol)[];
  value: any;
}

export async function setValueRemote<T extends object>(
  store: StatefulObject<T>,
  props: (string | number | symbol)[],
  value: any,
): Promise<void> {
  const scope = getScope(store);

  // TODO

  if (scope.storeType === 'private') return void 0;
  try {
    const commandName = getCommandName(PeerStoreCommandEnum.setValue, scope.storeName);
    scope.logger('setValueRemote').info(props, value);

    await scope.peer.serviceChannel.send<PeerStoreSetValueData, boolean>(
      'store',
      commandName,
      { props, value },
      { isBlocker: true },
    );
  } catch (err) {
    scope.logger.error('remote store is not connected');
  }
}
