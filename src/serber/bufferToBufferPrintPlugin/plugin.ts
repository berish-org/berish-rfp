import { ISerberPlugin } from '@berish/serber';
import { isBuffer, BufferTypeEnum } from './helper';
import { IPrint, PrintTypeEnum } from '../abstract';

export type IBuffer = Buffer | ArrayBuffer | SharedArrayBuffer | Uint8Array | Uint16Array | Uint32Array;

export interface IBufferPrint extends IPrint<PrintTypeEnum.printBuffer> {
  bufferType: BufferTypeEnum;
  data: Uint8Array;
}

export const bufferToBufferPrintPlugin: ISerberPlugin<IBuffer, IBuffer, {}> = {
  isForSerialize: (buffer) => {
    return isBuffer(buffer);
  },
  isForDeserialize: (buffer) => {
    return isBuffer(buffer);
  },
  // serialize: buffer => {
  //   return buffer;
  // },
  // deserialize: buffer => {
  //   return buffer;
  // },
};
