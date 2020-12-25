import '@berish/stateful/build/types';
import { RfpPeer } from './peer';
import { ServiceChannel } from './modules';

declare module '@berish/stateful/build/types' {
  export interface IStatefulScope<T> {
    peer: RfpPeer;
    serviceChannel: ServiceChannel;
    isConnected: boolean;
    connect: () => Promise<void>;
    disconnect: () => void;
    setStateRemote: (state: Partial<T>) => Promise<void>;
    setValueRemote: (props: (string | number | symbol)[], value: any) => Promise<void>;
    reactionSetValueRemote: (callback: (props: (string | number | symbol)[], value: any) => void) => () => void;
    reactionSetStateRemote: (callback: (state: Partial<T>) => void) => () => void;
  }
}
