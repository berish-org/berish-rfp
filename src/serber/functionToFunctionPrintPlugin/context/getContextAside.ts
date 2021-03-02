import type { PeerRequest } from '../../../peer';
import { magicalDictionary } from '../../../const';

export function getContextAside(request: PeerRequest) {
  const aside = request.chunk.aside;
  return aside && aside[magicalDictionary.contextAsideKey];
}
