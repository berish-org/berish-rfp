import LINQ from '@berish/linq';
import { getPrivateScope, getScope, StatefulObject } from '@berish/stateful';

/**
 * Удаляет при наличии внешнее изменение из кеша. Возвращает значение, было ли значение в кеше
 * @param store Хранилище
 * @param props Ключи
 * @param newValue Новое значение
 */
export function removeRemoteChange<T extends object>(
  store: StatefulObject<T>,
  props: (string | number | symbol)[],
  newValue: any,
) {
  const privateScope = getPrivateScope(store);
  const isExists = privateScope.remoteChanges.some((m) => LINQ.from(m[0]).equalsValues(props) && m[1] === newValue);
  if (isExists) {
    privateScope.remoteChanges = privateScope.remoteChanges.filter(
      (m) => !(LINQ.from(m[0]).equalsValues(props) && m[1] === newValue),
    );
  }

  return isExists;
}
