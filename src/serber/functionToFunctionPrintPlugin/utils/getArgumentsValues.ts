import type { PeerRequest } from '../../../peer/methods';
import { magicalDictionary } from '../../../constants';

export function getArgumentsValues(printArgs: any[], argsValue: any[], request: PeerRequest) {
  return printArgs.map((m, i) => {
    if (m === magicalDictionary.requestArgumentName) return request;
    if (typeof argsValue[i] === 'undefined') return undefined;
    return argsValue[i];
  });
}
