import { magicalDictionary } from '../../../const';

export function setContextAside<T extends (...args) => any>(func: T, context: any) {
  const newFunc = (...args) => func(...args);
  newFunc[magicalDictionary.contextAsideKey] = context;
  return newFunc as T;
}
