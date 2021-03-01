import '@berish/stateful/build/types';
import type { RfpPeer } from '../peer';
import type { ServiceChannel } from '../modules';
import type { PeerLogger } from '../logger';

export type PeerStoreType = 'public' | 'private' | 'protected';

declare module '@berish/stateful/build/types' {
  export interface IStatefulScope<T> {
    storeType: PeerStoreType;
    logger: PeerLogger;
    peer: RfpPeer;
    serviceChannel: ServiceChannel;

    isConnected: boolean;
    connect: () => Promise<void>;
    disconnect: () => void;

    sync: () => Promise<void>;
    setStateRemote: (state: Partial<T>) => Promise<void>;
    setValueRemote: (props: (string | number | symbol)[], value: any) => Promise<void>;
    reactionSetValueRemote: (callback: (props: (string | number | symbol)[], value: any) => void) => () => void;
    reactionSetStateRemote: (callback: (state: Partial<T>) => void) => () => void;
  }

  export interface IStatefulPrivateScope {
    remoteChanges: [(string | number | symbol)[], any][];
    listenId: string;
    unreceiveSetValue: () => void;
    unreceiveSetState: () => void;
  }
}
