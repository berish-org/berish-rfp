import { IRfpRequest } from '../../peer';
import { magicalDictionary } from '../../constants';

export function setContextAside<T extends (...args) => any>(func: T, context: any) {
  const newFunc = (...args) => func(...args);
  newFunc[magicalDictionary.contextAsideKey] = context;
  return newFunc as T;
}

export function getContextAside(request: IRfpRequest) {
  const aside = request.chunk.aside;
  return aside && aside[magicalDictionary.contextAsideKey];
}
