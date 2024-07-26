import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { GameBoardComponent } from './app/components/game-board/game-board.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideRouter([
      { path: '', component: GameBoardComponent },
      // Add other routes as needed
    ])
  ]
}).catch(err => console.error(err));