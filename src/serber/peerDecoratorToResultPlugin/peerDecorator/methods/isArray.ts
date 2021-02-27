export function isArray(x: any): x is Array<any> {
  return Boolean(x && typeof x.length !== 'undefined');
}
