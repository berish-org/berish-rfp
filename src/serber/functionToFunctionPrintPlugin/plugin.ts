import { ISerberPlugin, SERBER_PARENT_OBJECT_SYMBOL, SERBER_KEY_SYMBOL } from '@berish/serber';
import { RfpPeer } from '../../peer';
import { generatePrintId, getPrintName, getPrintArguments, setName, getAsideFromLocalFunction } from './helper';
import { SYMBOL_SERBER_PEER, getType, createPrint, IPrint, PrintTypeEnum } from '../abstract';
import { deferredReceivePrintFunction, startReceivePrintFunction, IDeferredList } from './network';
import { executeRemoteFunction } from './network';

export interface IFunction {
  (...args: any[]): any;
  meta?: { [key: string]: any };
}

export interface IFunctionPrint extends IPrint<PrintTypeEnum.printFunction> {
  /**
   * ID отпечатка.
   * Каждая функция, которая проходит через сериализацию в отпечаток генерирует специальный идентификатор, по которому функция начинает прослушиваться.
   * Когда отпечаток функции вызывается, он отправляет запрос с этим идентификатором. Так мы можем вызывать нужные нам функции по отпечаткам.
   */
  printId: string;
  /** Имя функции. */
  name: string;
  /** Наименование аргументов функции */
  args?: string[];
  meta?: { [key: string]: any };
}

/**
 * Параметр, в который передается отпечаток функции для отложенного старта прослушивания.
 * Если параметр не передаетя, то тогда все отпечатки будут прослушены сразу
 */
export const SYMBOL_SERBER_DEFERRED_LIST = Symbol('serberDeferredList');

/**
 * Параметр, в который передается название глобального пути (путь чанка).
 * Нужен только при сериализации, чтобы правильно давать имя для отпечатка функции в том случае, если у функции нет имени и нет ключа (то есть она сама родительская).
 * В таком случае, мы понимаем, что запросили чисто эту анонимную функцию по конкретному пути, значит и имя должны быть как путь.
 */
export const SYMBOL_SERBER_CHUNK_REPLY_PATH = Symbol('serberChunkPath');

export interface IFunctionToFunctionPrintPluginOptions {
  [SYMBOL_SERBER_PEER]: RfpPeer;
  [SYMBOL_SERBER_DEFERRED_LIST]?: IDeferredList;
  [SYMBOL_SERBER_CHUNK_REPLY_PATH]?: string;
}

export const functionToFunctionPrintPlugin: ISerberPlugin<
  IFunction,
  IFunctionPrint,
  IFunctionToFunctionPrintPluginOptions
> = {
  isForSerialize: obj => getType(obj) === 'function',
  isForDeserialize: obj => getType(obj) === 'printFunction',
  isAlreadySerialized: obj => functionToFunctionPrintPlugin.isForDeserialize(obj as IFunctionPrint),
  isAlreadyDeserialized: obj => functionToFunctionPrintPlugin.isForSerialize(obj as IFunction),

  serialize: (obj, options) => {
    const replyPath = options[SYMBOL_SERBER_CHUNK_REPLY_PATH];
    const peer = options[SYMBOL_SERBER_PEER];
    const deferredList = options[SYMBOL_SERBER_DEFERRED_LIST];
    const thisArg = options[SERBER_PARENT_OBJECT_SYMBOL];
    const key = options[SERBER_KEY_SYMBOL];

    const id = generatePrintId();
    const print: IFunctionPrint = {
      ...createPrint(PrintTypeEnum.printFunction),
      printId: generatePrintId(),
      name: getPrintName(obj, key, replyPath),
      args: getPrintArguments(obj),
    };

    if (deferredList) deferredReceivePrintFunction(print, obj, peer, deferredList, thisArg);
    else startReceivePrintFunction(print, obj, peer, thisArg);
    return print;
  },

  deserialize: (print, params) => {
    const peer = params[SYMBOL_SERBER_PEER];

    const withSend = (...args: any[]) => {
      const aside = getAsideFromLocalFunction(withSend);
      return executeRemoteFunction(peer, print, aside, args);
    };
    Object.defineProperty(withSend, 'name', { value: print.name });
    Object.defineProperty(withSend, 'toString', {
      value: function() {
        return `function ${print.name || ''}(${print.args.join(',')}) { [rfp code] }`;
      },
    });
    return withSend;
  },
};
