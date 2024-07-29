import { Injectable } from '@angular/core';
import { CardData } from '../components/card/card.component';

export type Seat = 'A1' | 'A2' | 'B1' | 'B2';
export type Team = 'A' | 'B';

export interface Player {
  name: string;
  seat: Seat;
  team: Team;
  hand: CardData[];
  isDealer: boolean;
  currentBid: number | 'Pass' | null;
  tricksTaken: number;
  isRevealingCards: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private players: Map<Seat, Player> = new Map();
  private readonly seats: Seat[] = ['A1', 'B1', 'A2', 'B2'];

  constructor() {
    this.initializePlayers();
  }

  private initializePlayers(): void {
    const names = ['Riley', 'Tyler', 'Nate', 'Jeremy'];
    this.seats.forEach((seat, index) => {
      this.players.set(seat, {
        name: names[index],
        seat: seat,
        team: this.getTeamForSeat(seat),
        hand: [],
        isDealer: index === 0, // First player is the dealer
        currentBid: null,
        tricksTaken: 0,
        isRevealingCards: false
      });
    });
  }

  getTeamForSeat(seat: Seat): Team {
    return seat.startsWith('A') ? 'A' : 'B';
  }

  getTeamForPlayer(playerNameOrSeat: string): Team {
    const player = this.getPlayerBySeatOrName(playerNameOrSeat);
    return player ? player.team : 'A'; // Default to 'A' if player not found
  }

  private getPlayerBySeatOrName(playerNameOrSeat: string): Player | undefined {
    // First, try to find by seat
    if (this.seats.includes(playerNameOrSeat as Seat)) {
      return this.players.get(playerNameOrSeat as Seat);
    }
    // If not found by seat, try to find by name
    return Array.from(this.players.values()).find(player => player.name === playerNameOrSeat);
  }

  dealCards(deck: CardData[]): void {
    this.players.forEach(player => player.hand = []);
    for (let i = 0; i < 9; i++) {
      this.seats.forEach(seat => {
        const player = this.players.get(seat);
        if (player) {
          const card = deck.pop();
          if (card) player.hand.push(card);
        }
      });
    }
  }

  getTeammates(): [Player, Player][] {
    const teamA = this.seats.filter(seat => seat.startsWith('A')).map(seat => this.players.get(seat)!);
    const teamB = this.seats.filter(seat => seat.startsWith('B')).map(seat => this.players.get(seat)!);
    return [teamA as [Player, Player], teamB as [Player, Player]];
  }

  resetPlayerState(): void {
    this.players.forEach(player => {
      player.hand = [];
      player.currentBid = null;
      player.tricksTaken = 0;
    });
  }

  rotateDealer(): void {
    const currentDealerIndex = this.seats.findIndex(seat => this.players.get(seat)!.isDealer);
    this.players.get(this.seats[currentDealerIndex])!.isDealer = false;
    const nextDealerIndex = (currentDealerIndex + 1) % this.seats.length;
    this.players.get(this.seats[nextDealerIndex])!.isDealer = true;
  }

  getPlayers(): Player[] {
    return Array.from(this.players.values());
  }

  getPlayerBySeat(seat: Seat): Player | undefined {
    return this.players.get(seat);
  }
}