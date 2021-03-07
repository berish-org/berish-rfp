import { EventEmitter } from '@berish/emitter';
import { PeerChunk } from '../chunk';
import type { Peer } from './peer';

export interface PeerScopeBlockerEventMap {
  block: PeerChunk<any>;
  unblock: PeerChunk<any>;

  clear: void;
}

export class PeerScope {
  private _peer: Peer = null;
  private _blockerEmitter = new EventEmitter<PeerScopeBlockerEventMap>();
  private _blockerChain: PeerChunk<any>[] = [];

  constructor(peer: Peer) {
    this._peer = peer;
  }

  public hasBlockers() {
    return this._blockerChain.length > 0;
  }

  public hasBeforeBlocker(chunk: PeerChunk<any>) {
    return this.getBeforeBlocker(chunk).length > 0;
  }

  public getBeforeBlocker(chunk: PeerChunk<any>): PeerChunk<any>[] {
    const index = this._blockerChain.indexOf(chunk);
    if (index > 0) return this._blockerChain.slice(0, index - 1);
    return [];
  }

  public async addBlocker(chunk: PeerChunk<any>) {
    this._peer.logger('peerScope')('addBlocker').info(chunk.chunkId);
    this._blockerChain.push(chunk);

    await this._blockerEmitter.emitAsync('block', chunk);
  }

  public async removeBlocker(chunk: PeerChunk<any>) {
    if (this._blockerChain.indexOf(chunk) !== -1) {
      this._peer.logger('peerScope')('removeBlocker').info(chunk.chunkId);
      this._blockerChain = this._blockerChain.filter((m) => m !== chunk);

      await this._blockerEmitter.emitAsync('unblock', chunk);
    }
  }

  public async waitBeforeUnblock(chunk: PeerChunk<any>) {
    let beforeChunks = this.getBeforeBlocker(chunk);
    if (beforeChunks.length <= 0) return void 0;

    this._peer
      .logger('peerScope')('waitBeforeUnblock')(chunk.chunkId)
      .info(beforeChunks.map((m) => m.chunkId));

    do {
      const unblockedChunk = await Promise.race<PeerChunk<any> | null>([
        this._blockerEmitter.waitEvent('clear').then(() => null),
        this._blockerEmitter.waitEvent('unblock'),
      ]);

      if (!unblockedChunk) return void 0;

      beforeChunks = beforeChunks.filter((m) => m !== unblockedChunk);
    } while (beforeChunks.length > 0);
  }

  public async clear() {
    this._peer.logger('peerScope').info(`clear`);

    this._blockerChain = [];
    await this._blockerEmitter.emitAsync('clear', null);

    this._blockerEmitter.offAll();
  }
}
