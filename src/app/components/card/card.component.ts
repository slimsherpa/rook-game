import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

export interface CardData {
  suit: string;
  number: number;
  count: number;
}

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  standalone: true,
  imports: [CommonModule, MatCardModule],
})
export class CardComponent {
  @Input() card!: CardData;
  @Input() selectable: boolean = false;
  @Input() selected: boolean = false;
  @Input() isTrump: boolean = false;
  @Output() cardClick = new EventEmitter<CardData>();

  onClick() {
    if (this.selectable) {
      this.cardClick.emit(this.card);
    }
  }
}