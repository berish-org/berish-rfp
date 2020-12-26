import { ISerberPlugin } from '@berish/serber';
import { Registrator } from '@berish/class';
import LINQ from '@berish/linq';
import { IPrint, PrintTypeEnum, getType, createPrint } from '../abstract';

export interface IClassPrint extends IPrint<PrintTypeEnum.printClass> {
  names: string[];
  data: { [key: string]: any };
}

export const SYMBOL_SERBER_REGISTRATOR = Symbol('serberRegistrator');

export interface IClassInstanceToClassPrintPluginOptions {
  [SYMBOL_SERBER_REGISTRATOR]?: Registrator;
}

export const classInstanceToClassPrintPlugin: ISerberPlugin<
  any,
  IClassPrint,
  IClassInstanceToClassPrintPluginOptions
> = {
  isForSerialize: (obj, options) => {
    const registrator = options[SYMBOL_SERBER_REGISTRATOR];
    if (!registrator) return false;
    return typeof obj === 'object' && registrator.isRegisteredInstance(obj);
  },
  isForDeserialize: (print, options) => {
    const registrator = options[SYMBOL_SERBER_REGISTRATOR];
    if (!registrator) return false;
    return getType(print) === 'printClass';
  },
  isAlreadySerialized: (obj, options) => classInstanceToClassPrintPlugin.isForDeserialize(obj, options),
  isAlreadyDeserialized: (obj, options) => classInstanceToClassPrintPlugin.isForSerialize(obj, options),
  serialize: (obj, options) => {
    const registrator = options[SYMBOL_SERBER_REGISTRATOR];
    const names = registrator.getNamesByInstance(obj);
    const data: { [key: string]: any } = {};

    const print: IClassPrint = {
      ...createPrint(PrintTypeEnum.printClass),
      names,
      data,
    };
    return print;
  },
  deserialize: (obj, options) => {
    const registrator = options[SYMBOL_SERBER_REGISTRATOR];
    const { names, data } = obj;
    const out: { [key: string]: any } = {};

    const classes = LINQ.from(names)
      .select((m) => registrator.getClassesByClassName(m))
      .selectMany((m) => m)
      .toArray();

    const mainClass = classes[0];
    if (!mainClass) return out;
    return registrator.getInstanceByClass(out, mainClass);
  },
};
