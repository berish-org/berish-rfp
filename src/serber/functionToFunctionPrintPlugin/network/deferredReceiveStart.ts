export interface DeferredReceiveList {
  [key: string]: () => void;
}

export function deferredReceiveStart(deferredFuncs: DeferredReceiveList) {
  const keys = Object.keys(deferredFuncs);
  keys.forEach((key) =>
    setTimeout(() => {
      try {
        deferredFuncs[key]();
      } catch (err) {
        // IGNORE
      }
    }, 0),
  );
}
