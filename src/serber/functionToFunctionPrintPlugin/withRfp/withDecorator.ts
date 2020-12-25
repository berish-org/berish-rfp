import { IWithRfp, withRfp } from './withRfp';
import { getType } from '../../abstract';

export function withDecorator(...decorators: IWithRfp<void>[]): IWithRfp<any>;
export function withDecorator(hideThrow: true, ...decorators: IWithRfp<void>[]): IWithRfp<any>;
export function withDecorator(hideThrow: boolean | IWithRfp, ...decorators: IWithRfp<void>[]): IWithRfp<any> {
  const hide = getType(hideThrow) === 'boolean' ? (hideThrow as boolean) : false;
  const values = getType(hideThrow) === 'boolean' ? decorators : ([hideThrow, ...decorators] as IWithRfp<void>[]);
  return withRfp(async (request, prevValue) => {
    for (const decorator of values) {
      try {
        await decorator(request, prevValue);
      } catch (err) {
        if (!hide) throw err;
      }
    }
    return prevValue;
  });
}
