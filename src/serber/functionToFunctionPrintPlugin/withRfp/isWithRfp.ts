import { IWithRfp, SYMBOL_WITH_RFP } from './withRfp';

export function isWithRfp(value: any): value is IWithRfp {
  if (value && value[SYMBOL_WITH_RFP] === true) return true;
  return false;
}
