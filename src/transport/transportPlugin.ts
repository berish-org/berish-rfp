import type { RfpPeer } from '../peer';

export interface TransportPlugin {
  beforeDataSend?: (peer: RfpPeer, data: any) => any;
  beforeTransportSend?: (peer: RfpPeer, binaryData: Buffer) => void | Buffer | Promise<void> | Promise<Buffer>;

  beforeDataResponse?: (peer: RfpPeer, data: any) => any;
  beforeTransportResponse?: (peer: RfpPeer, binaryData: Buffer) => void | Buffer | Promise<void> | Promise<Buffer>;
}
