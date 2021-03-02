export function promiseWhen<T>(arr: Promise<T>[]): Promise<T[]> {
  return new Promise<T[]>(async (resolve, reject) => {
    if (!isArray(arr)) throw new TypeError('promiseWhen accepts an array');

    const data: T[] = [];

    for (const item of arr) {
      try {
        const value = await Promise.resolve(item);
        data.push(value);
      } catch (err) {
        return reject(err);
      }
    }

    return resolve(data);
  });
}

function isArray(x: any): x is Array<any> {
  return Boolean(x && typeof x.length !== 'undefined');
}
