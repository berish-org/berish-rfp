import { PeerDecorator } from '../peerDecorator';

export function isPeerDecorator<T>(value: any): value is PeerDecorator<T> {
  if (value && typeof value === 'object' && value instanceof PeerDecorator) return true;
  return false;
}
