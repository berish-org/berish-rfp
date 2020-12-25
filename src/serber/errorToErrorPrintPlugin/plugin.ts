import { ISerberPlugin } from '@berish/serber';
import { IPrint, PrintTypeEnum, getType, createPrint } from '../abstract';

export interface IErrorPrint extends IPrint<PrintTypeEnum.printError> {
  name: string;
  message: string;
}

export const errorToErrorPrintPlugin: ISerberPlugin<Error, IErrorPrint, {}> = {
  isForSerialize: obj => obj instanceof Error,
  isForDeserialize: obj => getType(obj) === 'printError',
  isAlreadySerialized: obj => errorToErrorPrintPlugin.isForDeserialize(obj as IErrorPrint),
  isAlreadyDeserialized: obj => errorToErrorPrintPlugin.isForSerialize(obj as Error),
  serialize: obj => {
    const print: IErrorPrint = {
      ...createPrint(PrintTypeEnum.printError),
      name: obj.name,
      message: obj.message,
    };
    return print;
  },
  deserialize: obj => {
    const err = new Error(obj.message);
    err.name = obj.name;
    err.message = obj.message;
    delete err.stack;
    return err;
  },
};
