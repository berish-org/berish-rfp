import guid from 'berish-guid';

interface IStepPromiseData<T> {
  type: string;
  data?: T | Error;
}

export const SYMBOL_NEXT_STEP = Symbol('nextStep');

export async function nextPromise<T>(callback: (next: () => any) => T): Promise<T | typeof SYMBOL_NEXT_STEP> {
  const nextId = guid.guid();
  const rejectId = guid.guid();
  const resolveId = guid.guid();
  const promise = () =>
    new Promise<IStepPromiseData<T>>(async (resolve) => {
      let done = false;
      const send = (data: IStepPromiseData<T>) => {
        if (!done) {
          done = true;
          resolve(data);
        }
      };
      try {
        const next = () => send({ type: nextId });
        const result = await callback(next);
        send({ type: resolveId, data: result });
      } catch (err) {
        if (err && err.stack) {
          err.stack = null;
        }
        send({ type: rejectId, data: err });
      }
    });
  const result = await promise();
  if (result.type === nextId) {
    return SYMBOL_NEXT_STEP;
  } else if (result.type === rejectId) {
    throw result.data;
  }
  return result.data as T;
}
