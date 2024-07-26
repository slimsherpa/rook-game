import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, CardData } from '../card/card.component';
import { TrickRecap } from '../../services/game.service';

@Component({
  selector: 'app-hand-status',
  templateUrl: './hand-status.component.html',
  styleUrls: ['./hand-status.component.scss'],
  standalone: true,
  imports: [CommonModule, CardComponent],
})
export class HandStatusComponent {
  @Input() lastTrick?: TrickRecap;
  @Input() trump: string = '';
  @Input() isFifthTrick: boolean = false;
  @Input() runningScoreA: number = 0;
  @Input() runningScoreB: number = 0;

  isTrumpCard(card: CardData): boolean {
    return card.suit.toLowerCase() === this.trump.toLowerCase();
  }
}