import type { PeerRequest } from '../../../peer/methods';
import { magicalDictionary } from '../../../constants';

export function getContextAside(request: PeerRequest) {
  const aside = request.chunk.aside;
  return aside && aside[magicalDictionary.contextAsideKey];
}
