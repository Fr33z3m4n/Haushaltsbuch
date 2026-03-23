import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { UpdateService } from './core/services/update.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>'
})
export class App {
  title = 'HaushaltsBuch';
  constructor(_theme: ThemeService, updateService: UpdateService) {
    updateService.init();
  }
}
