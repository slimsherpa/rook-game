import { Injectable } from '@angular/core';
import { Player, Team } from './player.service';
import { ScoreService } from './score.service';
import { CardData } from '../components/card/card.component';

export interface TrickPlay {
  player: Player;
  card: CardData;
}

export interface TrickRecap {
  plays: { 
    player: string,
    team: Team,
    card: CardData,
    isTrickWinner: boolean 
  }[];
  winner: string;
  winnerTeam: Team;
  points: number;
}

export interface TrickCounts {
  [playerName: string]: number;
}

@Injectable({
  providedIn: 'root'
})
export class TrickService {
  private currentTrick: TrickPlay[] = [];
  private leadSuit: string | null = null;
  private trickCounts: { [playerName: string]: number } = {};

  constructor(private scoreService: ScoreService) {}

  getTrickCounts(): TrickCounts {
    return {...this.trickCounts};
  }

  resetTrickCounts(): void {
    this.trickCounts = {};
  }

  startNewTrick(): void {
    this.currentTrick = [];
    this.leadSuit = null;
  }

  playCard(player: Player, card: CardData): void {
    if (this.currentTrick.length === 0) {
      this.leadSuit = card.suit;
    }
    this.currentTrick.push({ player, card });
  }

  isValidPlay(player: Player, card: CardData): boolean {
    if (this.currentTrick.length === 0) {
      return true;
    }
    
    if (this.leadSuit && player.hand.some(c => c.suit === this.leadSuit)) {
      return card.suit === this.leadSuit;
    }
    
    return true; // Player can play any card if they don't have the lead suit
  }

  resolveTrick(trump: string): TrickRecap {
    let winningPlay = this.currentTrick[0];
  
    for (let play of this.currentTrick) {
      if (play.card.suit === trump && winningPlay.card.suit !== trump) {
        winningPlay = play;
      } else if (play.card.suit === winningPlay.card.suit && play.card.number > winningPlay.card.number) {
        winningPlay = play;
      }
    }
   
    const cards = this.currentTrick.map(play => play.card);
    this.scoreService.updateTrickScore(winningPlay.player, cards);
  
    // Update trick counts
    this.trickCounts[winningPlay.player.name] = (this.trickCounts[winningPlay.player.name] || 0) + 1;

    const trickScore = this.scoreService.getCurrentTrickScore();
    if (!trickScore) {
      throw new Error('Failed to get current trick score');
    }

    const trickRecap: TrickRecap = {
      plays: this.currentTrick.map(play => ({
        player: play.player.name,
        team: play.player.team,
        card: play.card,
        isTrickWinner: play === winningPlay
      })),
      winner: trickScore.winnerPlayer,
      winnerTeam: trickScore.winnerTeam,
      points: trickScore.points
    };

    return trickRecap;
  }

  getCurrentTrick(): TrickPlay[] {
    return this.currentTrick;
  }

  getTrickSize(): number {
    return this.currentTrick.length;
  }

  calculateTrickPoints(cards: CardData[]): number {
    return cards.reduce((sum: number, card: CardData) => {
      if (card.number === 5) return sum + 5;
      if (card.number === 10 || card.number === 13) return sum + 10;
      return sum;
    }, 0);
  }

}