import type, { ITypeofHandler, TypeofResult } from '@berish/typeof';
import { magicalDictionary } from '../constants';

/**
 * Параметр, который является RfpPeer
 */
export const SYMBOL_SERBER_PEER = Symbol('serberPeer');
export enum PrintTypeEnum {
  printFunction = 'pf',
  printClass = 'pc',
  printBuffer = 'pb',
  printError = 'pe',
}
export type TypeofResultWithPrint = TypeofResult | keyof typeof PrintTypeEnum;

const mainPrintTypeKey = '_t';
const customPrintTypeKey = '_pt';

export interface IPrint<T extends PrintTypeEnum> {
  [mainPrintTypeKey]: typeof magicalDictionary.mainKey;
  [customPrintTypeKey]: T;
}

const printFunctionHandler: ITypeofHandler<TypeofResultWithPrint> = {
  typeName: 'printFunction',
  handler: (value, preview) =>
    preview === 'object' && isPrint(value) && value[customPrintTypeKey] === PrintTypeEnum.printFunction,
};

const printClassHandler: ITypeofHandler<TypeofResultWithPrint> = {
  typeName: 'printClass',
  handler: (value, preview) =>
    preview === 'object' && isPrint(value) && value[customPrintTypeKey] === PrintTypeEnum.printClass,
};

const printBufferHandler: ITypeofHandler<TypeofResultWithPrint> = {
  typeName: 'printBuffer',
  handler: (value, preview) =>
    preview === 'object' && isPrint(value) && value[customPrintTypeKey] === PrintTypeEnum.printBuffer,
};

const printErrorHandler: ITypeofHandler<TypeofResultWithPrint> = {
  typeName: 'printError',
  handler: (value, preview) =>
    preview === 'object' && isPrint(value) && value[customPrintTypeKey] === PrintTypeEnum.printError,
};

export function getType(value: any) {
  return type<TypeofResultWithPrint>(value, [
    printFunctionHandler,
    printClassHandler,
    printBufferHandler,
    printErrorHandler,
  ]);
}

export function createPrint<T extends PrintTypeEnum>(type: T): IPrint<T> {
  return {
    [mainPrintTypeKey]: magicalDictionary.mainKey,
    [customPrintTypeKey]: type,
  };
}

function isPrint(data: any): data is IPrint<any> {
  if (
    data &&
    typeof data === 'object' &&
    mainPrintTypeKey in data &&
    customPrintTypeKey in data &&
    data[mainPrintTypeKey] === magicalDictionary.mainKey
  )
    return true;
  return false;
}
