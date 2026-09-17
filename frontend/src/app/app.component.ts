import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfigService } from './core/services/config.service';
import { LoadingOverlayComponent } from './shared/loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingOverlayComponent],
  template: '<app-loading-overlay /><router-outlet />'
})
export class AppComponent implements OnInit {
  constructor(private config: ConfigService) {}

  ngOnInit(): void {
    this.config.cargarYAplicar();
  }
}
