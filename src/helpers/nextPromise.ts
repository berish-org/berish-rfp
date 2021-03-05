export const SYMBOL_NEXT_STEP = Symbol('nextStep');

export async function nextPromise<T>(
  callback: (next: () => any) => T | Promise<T>,
): Promise<T | typeof SYMBOL_NEXT_STEP> {
  return new Promise<T | typeof SYMBOL_NEXT_STEP>(async (resolve, reject) => {
    try {
      const next = () => resolve(SYMBOL_NEXT_STEP);
      const result = await callback(next);
      return resolve(result);
    } catch (err) {
      return reject(err);
    }
  });
}
