import { Injectable } from '@angular/core';
import { CardData } from '../components/card/card.component';

@Injectable({
  providedIn: 'root'
})
export class DeckService {
  createDeck(): CardData[] {
    const suits: CardData['suit'][] = ['Red', 'Yellow', 'Black', 'Green'];
    const numbers = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    const deck: CardData[] = [];

    for (let suit of suits) {
      for (let number of numbers) {
        deck.push({
          suit,
          number,
          count: number === 5 ? 5 : number === 10 || number === 13 ? 10 : 0
        });
      }
    }

    return deck;
  }

  shuffleDeck(deck: CardData[]): void {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }
}