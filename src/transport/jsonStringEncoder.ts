import type { PeerTransportStringEncoder } from './transport';

export const jsonStringEncoder: PeerTransportStringEncoder = {
  encode: (data) => {
    const json = data && data.toJSON();
    return json && JSON.stringify(json.data);
  },
  decode: (binary) => {
    try {
      const json: number[] = binary && JSON.parse(binary);
      return json && Buffer.from(json);
    } catch (err) {
      return null;
    }
  },
};
