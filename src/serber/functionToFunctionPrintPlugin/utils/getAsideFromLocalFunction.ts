import { magicalDictionary } from '../../../constants';
import type { IFunction } from '../plugin';

export function getAsideFromLocalFunction(func: IFunction) {
  return func[magicalDictionary.contextAsideKey]
    ? { [magicalDictionary.contextAsideKey]: func[magicalDictionary.contextAsideKey] }
    : {};
}
