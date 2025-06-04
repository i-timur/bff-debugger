import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {WsLogsComponent} from './ws-logs/ws-logs.component';

@Component({
  selector: 'app-root',
  imports: [WsLogsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'bff-logger';
}
