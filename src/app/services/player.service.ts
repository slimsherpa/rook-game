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
  private players: Player[] = [];

  constructor() {
    this.players = this.initializePlayers();
  }

  getTeamForSeat(seat: Seat): Team {
    return seat.startsWith('A') ? 'A' : 'B';
  }

  initializePlayers(): Player[] {
    const seats: Seat[] = ['A1', 'B1', 'A2', 'B2'];
    const names = ['Riley', 'Tyler', 'Nate', 'Jeremy'];

    return seats.map((seat, index) => ({
      name: names[index],
      seat: seat,
      team: this.getTeamForSeat(seat),
      hand: [],
      isDealer: false,
      currentBid: null,
      tricksTaken: 0,
      isRevealingCards: false
    }));
  }

  dealCards(players: Player[], deck: CardData[]): void {
    players.forEach(player => player.hand = []);
    for (let i = 0; i < 9; i++) {
      players.forEach(player => {
        const card = deck.pop();
        if (card) player.hand.push(card);
      });
    }
  }

  getTeammates(players: Player[]): [Player, Player][] {
    return [
      players.filter(p => p.team === 'A') as [Player, Player],
      players.filter(p => p.team === 'B') as [Player, Player]
    ];
  }

  getTeamForPlayer(playerName: string): Team {
    const player = this.players.find(p => p.name === playerName);
    return player ? player.team : 'B'; // Default to 'B' if player not found
  }

  resetPlayerState(players: Player[]): void {
    players.forEach(player => {
      player.hand = [];
      player.currentBid = null;
      player.tricksTaken = 0;
    });
  }

  rotateDealer(players: Player[]): void {
    const currentDealerIndex = players.findIndex(p => p.isDealer);
    players[currentDealerIndex].isDealer = false;
    const nextDealerIndex = (currentDealerIndex + 1) % players.length;
    players[nextDealerIndex].isDealer = true;
  }
}