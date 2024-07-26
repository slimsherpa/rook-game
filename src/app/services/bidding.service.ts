import { Injectable } from '@angular/core';
import { Player } from './player.service';

@Injectable({
  providedIn: 'root'
})
export class BiddingService {
  private currentBid: number | null = null;
  private passCount: number = 0;
  private players: Player[] = [];
  private bidWinner: Player | null = null;
  private passedPlayers: Set<Player> = new Set();
  private currentBidderIndex: number = 0;

  readonly validBidValues: (number | 'Pass' | null)[] = [null, 'Pass', 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120];

  startBidding(players: Player[], startingPlayerIndex: number): void {
    this.currentBid = null;
    this.passCount = 0;
    this.players = players;
    this.bidWinner = null;
    this.passedPlayers.clear();
    this.currentBidderIndex = startingPlayerIndex;
  }

  placeBid(player: Player, bid: number | 'Pass' | null): Player | null {
    if (bid === 'Pass' || bid === null) {
      this.passedPlayers.add(player);
      this.passCount++;
    } else {
      this.currentBid = bid;
      this.bidWinner = player;
      this.passCount = 0;
    }

    if (this.passCount === 3 || bid === 120 || this.passedPlayers.size === this.players.length - 1) {
      return this.bidWinner;
    }

    this.moveToNextBidder();
    return null;
  }

  getValidBids(player: Player): (number | 'Pass' | null)[] {
    if (this.passedPlayers.has(player)) {
      return [];
    }
    return this.validBidValues.filter(bid => 
      bid === 'Pass' || bid === null || (typeof bid === 'number' && (this.currentBid === null || bid > this.currentBid))
    );
  }

  isValidBid(bid: number | 'Pass' | null, player: Player): boolean {
    if (bid === 'Pass' || bid === null) return true;
    const currentBid = this.getCurrentBid();
    if (currentBid === null) {
      return typeof bid === 'number' && bid >= 65 && bid <= 120;
    }
    return typeof bid === 'number' && bid > currentBid && bid <= 120;
  }

  canBid(player: Player): boolean {
    return !this.passedPlayers.has(player) && this.players[this.currentBidderIndex] === player;
  }

  getCurrentBid(): number | null {
    return this.currentBid;
  }

  getCurrentBidder(): Player {
    return this.players[this.currentBidderIndex];
  }

  private moveToNextBidder(): void {
    do {
      this.currentBidderIndex = (this.currentBidderIndex + 1) % this.players.length;
    } while (this.passedPlayers.has(this.players[this.currentBidderIndex]));
  }

  resetBids(players: Player[]): void {
    players.forEach(player => {
      player.currentBid = null;
    });
    this.currentBidderIndex = -1;
    this.currentBid = null;
    this.passCount = 0;
  }
  
}