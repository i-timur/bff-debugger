import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ConsoleMonitorComponent } from './components/console-monitor/console-monitor.component';
import { NetworkMonitorComponent } from './components/network-monitor/network-monitor.component';
import { WebSocketService } from './services/websocket.service';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ConsoleMonitorComponent,
    NetworkMonitorComponent,
    NzLayoutModule,
    NzTabsModule,
  ],
  template: `
    <div *ngIf="!initialized" style="padding: 20px; text-align: center;">
      Initializing...
    </div>
    <nz-layout class="app-layout" *ngIf="initialized">
      <nz-header>
        <div class="logo">BFF Debugger</div>
      </nz-header>
      <nz-content>
        <nz-tabset>
          <nz-tab nzTitle="Network">
            <app-network-monitor></app-network-monitor>
          </nz-tab>
          <nz-tab nzTitle="Console">
            <app-console-monitor></app-console-monitor>
          </nz-tab>
        </nz-tabset>
      </nz-content>
    </nz-layout>
  `,
  styles: [
    `
      .app-layout {
        height: 100%;
      }
      nz-header {
        background: #fff;
        padding: 0 16px;
        display: flex;
        align-items: center;
      }
      .logo {
        font-size: 18px;
        font-weight: bold;
      }
      nz-content {
        padding: 16px;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  initialized = false;

  constructor(private wsService: WebSocketService) {
    console.log('AppComponent constructor called');
  }

  ngOnInit() {
    console.log('AppComponent initialized');
    this.initialized = true;

    // Connect to WebSocket when popup opens
    chrome.runtime.sendMessage(
      {
        type: 'CONNECT',
        url: 'ws://localhost:3000', // Update this to match your backend WebSocket URL
      },
      (response) => {
        console.log('Connection response:', response);
      }
    );
  }
}
