import type { Peer } from '../peer';

export interface TransportPlugin {
  beforeDataSend?: (peer: Peer, data: any) => any;
  beforeTransportSend?: (peer: Peer, binaryData: Buffer) => void | Buffer | Promise<void> | Promise<Buffer>;

  beforeDataResponse?: (peer: Peer, data: any) => any;
  beforeTransportResponse?: (peer: Peer, binaryData: Buffer) => void | Buffer | Promise<void> | Promise<Buffer>;
}
