import { IRfpRequest } from '../../../peer';
import { withDecorator } from './withDecorator';

export const SYMBOL_WITH_RFP = Symbol('withRfp');

type WithRfpInput<Result = any> = (request: IRfpRequest, prevValue?: any) => Result;

export interface IWithRfp<Result = any> {
  (request: IRfpRequest, prevValue?: any): Result;
  [SYMBOL_WITH_RFP]?: boolean;
  withDecorator: typeof withDecorator;
  withRfp: typeof withRfp;
}

export function withRfp<Result>(callback: WithRfpInput<Result>): IWithRfp<Result> {
  const withRfpFunction: IWithRfp<Result> = (request, prevValue) => callback(request, prevValue);
  withRfpFunction[SYMBOL_WITH_RFP] = true;
  withRfpFunction.withDecorator = withDecorator;
  withRfpFunction.withRfp = (newCallback) =>
    withRfp((request, prevValue) => {
      const result = callback(request, prevValue);
      if (result instanceof Promise) {
        return result.then((result) => newCallback(request, result));
      }
      return newCallback(request, result);
    }) as any;
  return withRfpFunction as IWithRfp<Result>;
}
