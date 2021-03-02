import { Peer } from '../peer';

export class PeerPull {
  private _peers: Peer[] = [];

  public get peers() {
    return this._peers;
  }

  public registerPeer(peer: Peer) {
    const index = this.peers.indexOf(peer);
    if (index === -1) this._peers = this.peers.concat(peer);
  }

  public unregisterPeer(peer: Peer) {
    if (this.peers.indexOf(peer) !== -1) this._peers = this.peers.filter((m) => m !== peer);
  }
}
