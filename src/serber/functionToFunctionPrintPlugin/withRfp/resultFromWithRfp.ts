import { isWithRfp } from './isWithRfp';
import { IRfpRequest } from '../../../peer';

export async function resultFromWithRfp(value: any, request: IRfpRequest) {
  let result: any = value;
  if (isWithRfp(result)) result = await result(request, void 0);
  if (Array.isArray(result)) result = await Promise.all(result.map((m) => resultFromWithRfp(m, request)));
  if (result instanceof Promise) result = await result;
  if (isWithRfp(result)) return resultFromWithRfp(result, request);
  return result;
}
