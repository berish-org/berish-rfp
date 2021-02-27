export interface DeferredReceiveList {
  [key: string]: () => void;
}

export function deferredReceiveStart(deferredFuncs: DeferredReceiveList) {
  const keys = Object.keys(deferredFuncs);
  for (const key of keys) {
    setImmediate(() => {
      deferredFuncs[key]();
    });
  }
}
