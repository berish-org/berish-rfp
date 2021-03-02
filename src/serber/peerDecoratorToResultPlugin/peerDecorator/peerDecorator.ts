import type { PeerRequest } from '../../../peer/receiveType';
import { isPeerDecorator, isArray } from './methods';

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

  public static is(value: any): value is PeerDecorator<any> {
    return isPeerDecorator(value);
  }

  public static create<T>(fn: PeerDecoratorFunction<T>) {
    return new PeerDecorator(fn);
  }

  public static resolve<T>(value: PeerDecoratorFunctionValue<T>): PeerDecorator<T> {
    if (isPeerDecorator(value)) {
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

      return Promise.all(arr.map((item) => PeerDecorator.resolve(item).call(request)));
    }) as PeerDecorator<PeerDecoratorValue<T>[]>;
  }

  public static when<T>(arr: T[]): PeerDecorator<T[]> {
    return new PeerDecorator(async (request) => {
      if (!isArray(arr)) throw new TypeError('PeerDecorator.when accepts an array');

      const data = [];

      for (const item of arr) {
        try {
          const value = await PeerDecorator.resolve(item).call(request);
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

      return Promise.race(arr.map((item) => PeerDecorator.resolve(item).call(request)));
    }) as PeerDecorator<T extends PeerDecorator<infer U> ? U : T>;
  }

  private constructor(fn: PeerDecoratorFunction<T>) {
    if (typeof fn !== 'function') throw new TypeError('PeerDecorator constructor argument is not a function');

    this._fn = fn;
  }

  public next<TNextResult = T>(onfulfilled?: PeerDecoratorNextFunction<T, TNextResult>): PeerDecorator<TNextResult> {
    const newDecorator = new PeerDecorator<TNextResult>(async (request) => {
      const result = await this.call(request);
      if (!onfulfilled) return result;

      return onfulfilled(request, result) as any;
    });
    return newDecorator;
  }

  public catch<TNextResult = T>(onrejected?: PeerDecoratorCatchFunction<TNextResult>) {
    const newDecorator = new PeerDecorator<TNextResult | T>(async (request) => {
      try {
        const result = await this.call(request);
        return result;
      } catch (err) {
        if (!onrejected) throw err;
        return onrejected(request, err) as any;
      }
    });

    return newDecorator;
  }

  public async call(request: PeerRequest): Promise<T> {
    if (this._fn) {
      try {
        const data = await this._fn(request);
        return this.final(request, data, 'resolve');
      } catch (err) {
        const data = await this.final(request, err, 'reject');
        throw data;
      }
    }

    return undefined;
  }

  private async final(request: PeerRequest, data: any, status: 'resolve' | 'reject') {
    if (this === data) throw new TypeError('A PeerDecorator cannot be resolved with itself');

    while (isPeerDecorator(data)) {
      data = await data.call(request);
    }

    if (status === 'resolve' || status === 'reject') return data;

    return undefined;
  }
}
