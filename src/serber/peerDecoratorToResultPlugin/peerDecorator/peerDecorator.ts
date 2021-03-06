import type { PeerRequest } from '../../../peer/receiveType';
import { isArray } from './methods';

export type PeerDecoratorFunctionValue<T> = T | PeerDecorator<T> | Promise<T> | Promise<PeerDecorator<T>>;

export type PeerDecoratorFunction<T> = (request: PeerRequest) => PeerDecoratorFunctionValue<T>;

export type PeerDecoratorNextFunction<TValue, T> = (
  request: PeerRequest,
  data: TValue,
) => PeerDecoratorFunctionValue<T>;

export type PeerDecoratorCatchFunction<T> = (request: PeerRequest, reason?: any) => PeerDecoratorFunctionValue<T>;

export type PeerDecoratorValue<T> = T extends PeerDecorator<infer U> ? U : T;

export class PeerDecorator<T> {
  private _fn: PeerDecoratorFunction<T> = undefined;

  public static async execute<T>(peerDecorator: PeerDecorator<T>, request: PeerRequest): Promise<T> {
    peerDecorator = PeerDecorator.is(peerDecorator) ? peerDecorator : PeerDecorator.resolve(peerDecorator);

    if (peerDecorator._fn) {
      try {
        const data = await peerDecorator._fn(request);
        return peerDecorator.final(request, data);
      } catch (err) {
        const data = await peerDecorator.final(request, err);
        throw data;
      }
    }

    return undefined;
  }

  public static is<T>(value: any): value is PeerDecorator<T> {
    if (value && typeof value === 'object' && value instanceof PeerDecorator) return true;
    return false;
  }

  public static create<T>(fn: PeerDecoratorFunction<T>) {
    return new PeerDecorator(fn);
  }

  public static resolve<T>(value: PeerDecoratorFunctionValue<T>): PeerDecorator<T> {
    if (PeerDecorator.is(value)) {
      return value;
    }

    return new PeerDecorator(() => {
      return value;
    });
  }

  public static reject<T>(value: PeerDecoratorFunctionValue<T>) {
    return new PeerDecorator<never>((request) => {
      throw value;
    });
  }

  public static all<T>(arr: T[]): PeerDecorator<PeerDecoratorValue<T>[]> {
    return new PeerDecorator((request) => {
      if (!isArray(arr)) throw new TypeError('PeerDecorator.all accepts an array');

      return Promise.all(arr.map((item) => PeerDecorator.execute(PeerDecorator.resolve(item), request)));
    }) as PeerDecorator<PeerDecoratorValue<T>[]>;
  }

  public static when<T>(arr: T[]): PeerDecorator<T[]> {
    return new PeerDecorator(async (request) => {
      if (!isArray(arr)) throw new TypeError('PeerDecorator.when accepts an array');

      const data = [];

      for (const item of arr) {
        try {
          const value = await PeerDecorator.execute(PeerDecorator.resolve(item), request);
          data.push(value);
        } catch (err) {
          throw err;
        }
      }

      return data;
    });
  }

  public static race<T>(arr: T[]): PeerDecorator<PeerDecoratorValue<T>> {
    return new PeerDecorator((request) => {
      if (!isArray(arr)) throw new TypeError('PeerDecorator.race accepts an array');

      return Promise.race(arr.map((item) => PeerDecorator.execute(PeerDecorator.resolve(item), request)));
    }) as PeerDecorator<T extends PeerDecorator<infer U> ? U : T>;
  }

  private constructor(fn: PeerDecoratorFunction<T>) {
    if (typeof fn !== 'function') throw new TypeError('PeerDecorator constructor argument is not a function');

    this._fn = fn;
  }

  public next<TNextResult = T>(onfulfilled?: PeerDecoratorNextFunction<T, TNextResult>): PeerDecorator<TNextResult> {
    const newDecorator = new PeerDecorator<TNextResult>(async (request) => {
      const result = await PeerDecorator.execute(this, request);
      if (!onfulfilled) return result;

      return onfulfilled(request, result) as any;
    });
    return newDecorator;
  }

  public catch<TNextResult = T>(onrejected?: PeerDecoratorCatchFunction<TNextResult>) {
    const newDecorator = new PeerDecorator<TNextResult | T>(async (request) => {
      try {
        const result = await PeerDecorator.execute(this, request);
        return result;
      } catch (err) {
        if (!onrejected) throw err;
        return onrejected(request, err) as any;
      }
    });

    return newDecorator;
  }

  private async final(request: PeerRequest, data: any) {
    if (this === data) throw new TypeError('A PeerDecorator cannot be resolved with itself');

    while (PeerDecorator.is(data)) {
      data = await PeerDecorator.execute(data, request);
    }

    return data;
  }
}
