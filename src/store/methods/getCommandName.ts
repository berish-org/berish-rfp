import { PeerStoreType } from '../extension';

export enum PeerStoreCommandEnum {
  setValue = 'setValue',
  setState = 'setState',
}

export function getCommandName(cmd: PeerStoreCommandEnum, type: PeerStoreType) {
  return `[${type}]:${cmd}`;
}
