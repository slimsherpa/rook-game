import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Seat } from '../../services/player.service';

type ViewOption = Seat | 'God';

@Component({
  selector: 'app-select-player-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="player-selector">
      <button 
        *ngFor="let option of viewOptions" 
        (click)="selectOption(option)"
        [class.selected]="selectedOption === option"
        class="player-button">
        {{ option }}
      </button>
    </div>
  `,
  styles: [`
    .player-selector {
      position: fixed;
      top: 210px;
      left: 30px;
      display: flex;
      flex-direction: column;
      opacity: 0.4;
    }
    
    .player-button {
      margin: 5px 0;
      padding: 10px 15px;
      border: 2px solid var(--color-accent);
      background-color: var(--color-bg-light);
      color: var(--color-text);
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .player-button:hover {
      background-color: var(--color-accent);
      color: var(--color-bg-dark);
    }
    
    .player-button.selected {
      background-color: var(--color-accent);
      color: var(--color-bg-dark);
      font-weight: bold;
    }
  `]
})
export class SelectPlayerViewComponent {
  viewOptions: ViewOption[] = ['A1', 'B1', 'A2', 'B2', 'God'];
  selectedOption: ViewOption | null = null;

  @Output() optionSelected = new EventEmitter<ViewOption>();

  selectOption(option: ViewOption) {
    this.selectedOption = option;
    this.optionSelected.emit(option);
  }
}