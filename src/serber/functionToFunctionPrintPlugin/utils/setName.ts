export function setName(originalFunction: (...args: any[]) => any, name: string) {
  Object.defineProperty(originalFunction, 'name', { value: name });
  return originalFunction;
  // const placeholder = {
  //   [name](...args) {
  //     return originalFunction(...args);
  //   },
  // };
  // return placeholder[name];
}
