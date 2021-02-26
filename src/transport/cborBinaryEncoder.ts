import type { PeerTransportBinaryEncoder } from './transport';

export const cborBinaryEncoder: PeerTransportBinaryEncoder = {
  encode: (data) => data && (getCbor().encodeAsync(data) as Promise<Buffer>),
  decode: (binary) => binary && getCbor().decode(binary),
};

let cbor = null;
function getCbor() {
  if (!cbor) cbor = require('cbor');
  return cbor;
}
