import { IWithRfp, withRfp } from './withRfp';

export function allRfp(...values: IWithRfp<any>[]) {
  return withRfp((request, prevValue) => {
    return values.map((m) => m(request, prevValue));
  });
}
