import type { PeerRequest } from '../../../peer';
import { magicalDictionary } from '../../../const';

export function getArgumentsValues(printArgs: any[], argsValue: any[], request: PeerRequest) {
  return printArgs.map((m, i) => {
    if (m === magicalDictionary.requestArgumentName) return request;
    if (typeof argsValue[i] === 'undefined') return undefined;
    return argsValue[i];
  });
}
