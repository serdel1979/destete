import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfigService } from './core/services/config.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />'
})
export class AppComponent implements OnInit {
  constructor(private config: ConfigService) {}

  ngOnInit(): void {
    this.config.cargarYAplicar();
  }
}
