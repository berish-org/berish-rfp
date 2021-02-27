import { RfpPeer } from '../peer';

export class PeerPull {
  private _peers: RfpPeer[] = [];

  public get peers() {
    return this._peers;
  }

  public registerPeer(peer: RfpPeer) {
    const index = this.peers.indexOf(peer);
    if (index === -1) this._peers = this.peers.concat(peer);
  }

  public unregisterPeer(peer: RfpPeer) {
    if (this.peers.indexOf(peer) !== -1) this._peers = this.peers.filter((m) => m !== peer);
  }
}
