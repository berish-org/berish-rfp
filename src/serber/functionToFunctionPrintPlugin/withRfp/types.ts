import { IWithRfp } from './withRfp';

export type ResultFromWithRFP<T> = T extends IWithRfp<infer Result> ? Result : T;
