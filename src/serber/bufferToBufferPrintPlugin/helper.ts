import { IBuffer } from './plugin';

export enum BufferTypeEnum {
  default = 'default',
  array = 'array',
  sharedArray = 'array',
  uint8 = 'uint8',
  uint16 = 'uint16',
  uint32 = 'uint32',
}

export function isBuffer(data: any): data is Buffer {
  const type = getTypeBuffer(data);
  return !!type;
}

export function getTypeBuffer(data: IBuffer): BufferTypeEnum {
  if (data instanceof Buffer) return BufferTypeEnum.default;
  if (data instanceof ArrayBuffer) return BufferTypeEnum.array;
  if (data instanceof SharedArrayBuffer) return BufferTypeEnum.sharedArray;
  if (data instanceof Uint8Array) return BufferTypeEnum.uint8;
  if (data instanceof Uint16Array) return BufferTypeEnum.uint16;
  if (data instanceof Uint32Array) return BufferTypeEnum.uint32;
  return null;
}
