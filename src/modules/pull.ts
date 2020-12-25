import { RfpPeer } from '../peer';

export class RfpPull {
  private _peers: RfpPeer[] = [];

  public get peers() {
    return this._peers;
  }

  public register(peer: RfpPeer) {
    const index = this.peers.indexOf(peer);
    if (index === -1) this._peers = this.peers.concat(peer);
    return () => this.unregister(peer);
  }

  public unregister(peer: RfpPeer) {
    if (this.peers.indexOf(peer) !== -1) this._peers = this.peers.filter(m => m !== peer);
  }
}
