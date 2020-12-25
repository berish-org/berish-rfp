import { createStateful, StatefulObject, getScope } from '@berish/stateful';
import { RfpPeer } from '../peer';
import { ServiceChannel } from './serviceChannel';
import LINQ from '@berish/linq';

export type StoreType = 'public' | 'private' | 'protected';
export enum StoreCommandsTypeEnum {
  setValue = 'setValue',
  setState = 'setState',
}

interface ISetValueData {
  props: (string | number | symbol)[];
  value: any;
}

type SetStateData<T> = Partial<T>;

function getCommandName(cmd: StoreCommandsTypeEnum, type: StoreType) {
  return `[${type}]:${cmd}`;
}

export function createStore<T extends {} = {}>(peer: RfpPeer, target: T, type: StoreType) {
  const store = createStateful(target);
  const scope = getScope(store);
  const logger = peer.getLogger()('store');

  scope.reactionSetValueRemote = (callback) => {
    const commandName = getCommandName(StoreCommandsTypeEnum.setValue, type);
    return scope.serviceChannel.receive<ISetValueData>(commandName, ({ serviceData }) => {
      logger(type)(StoreCommandsTypeEnum.setValue)('reactionSetValueRemote').info(serviceData);
      const { props, value } = serviceData;
      callback(props, value);
    });
  };
  scope.reactionSetStateRemote = (callback) => {
    const commandName = getCommandName(StoreCommandsTypeEnum.setState, type);
    return scope.serviceChannel.receive<SetStateData<T>>(commandName, ({ serviceData }) => {
      logger(type)(StoreCommandsTypeEnum.setState)('reactionSetStateRemote').info(serviceData);
      callback(serviceData);
    });
  };
  scope.setValueRemote = async (props, value) => {
    if (type === 'private') return;
    try {
      const commandName = getCommandName(StoreCommandsTypeEnum.setValue, type);
      logger(type)(StoreCommandsTypeEnum.setValue)('setValueRemote').info(props, value);
      await scope.serviceChannel.send<ISetValueData, boolean>(commandName, { props, value }, { isBlocker: true });
    } catch (err) {
      logger(type).error('remote store is not connected');
    }
  };
  scope.setStateRemote = async (state) => {
    if (type === 'private') return;
    try {
      const commandName = getCommandName(StoreCommandsTypeEnum.setState, type);
      logger(type)(StoreCommandsTypeEnum.setState)('setStateRemote').info(state);
      await scope.serviceChannel.send<SetStateData<T>, boolean>(commandName, state, { isBlocker: true });
    } catch (err) {
      logger(type).error('remote store is not connected');
    }
  };
  scope.peer = peer;
  scope.serviceChannel = ServiceChannel.getServiceChannel('store');
  scope.serviceChannel.setPeer(peer);
  scope.isConnected = false;
  scope.connect = () => connectStore(store, type);
  scope.disconnect = null;
  return store;
}

export async function connectStore<T extends {} = {}>(store: StatefulObject<T>, type: StoreType) {
  const scope = getScope(store);
  const logger = scope.peer.getLogger()('store');
  if (scope && !scope.isConnected) {
    let unrecursiveDict: [(string | number | symbol)[], any][] = [];
    let listenId = scope.listenChange(async (props, oldValue, newValue) => {
      if (scope.setValueRemote) {
        const existsInUnrecursiveDict = unrecursiveDict.some(
          (m) => LINQ.from(m[0]).equalsValues(props) && m[1] === newValue,
        );
        if (existsInUnrecursiveDict)
          unrecursiveDict = unrecursiveDict.filter((m) => !(LINQ.from(m[0]).equalsValues(props) && m[1] === newValue));
        else await scope.setValueRemote(props, newValue);
      }
    });
    let unreceiveSetValue = scope.reactionSetValueRemote((props, value) => {
      unrecursiveDict.push([props, value]);
      scope.setValue(props, value);
    });
    let unreceiveSetState = scope.reactionSetStateRemote((state) => scope.setState(state));
    scope.isConnected = true;
    logger(type).info('connected');
    if (Object.keys(scope.target).length > 0) {
      await scope.setStateRemote(scope.target);
      logger(type).info('setStateRemote of initial state');
    }
    scope.disconnect = () => {
      scope.unlistenChange(listenId);
      unreceiveSetValue();
      unreceiveSetState();
      unrecursiveDict = null;
      listenId = null;
      unreceiveSetValue = null;
      unreceiveSetState = null;
      scope.disconnect = null;
      scope.isConnected = false;

      logger(type).info('disconnectedd');
    };
  }
}
