import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebSocketService } from '../../services/websocket.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
}

@Component({
  selector: 'app-console-monitor',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule,
  ],
  template: `
    <div class="console-monitor">
      <div class="toolbar">
        <button nz-button nzType="primary" (click)="clearLogs()">
          <span nz-icon nzType="delete"></span>
          Clear
        </button>
      </div>

      <nz-table
        #consoleTable
        tableScroll="scroll"
        [nzData]="logs"
        [nzScroll]="{ y: 'calc(100vh - 500px)' }"
        [nzShowPagination]="false"
        [nzFrontPagination]="false"
      >
        <thead>
          <tr>
            <th>Time</th>
            <th>Level</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let log of consoleTable.data">
            <td>{{ log.timestamp | date : 'medium' }}</td>
            <td>
              <nz-tag [nzColor]="getLevelColor(log.level)">
                {{ log.level.toUpperCase() }}
              </nz-tag>
            </td>
            <td>
              <div
                class="log-message"
                [innerHTML]="formatMessage(log.message)"
              ></div>
              <pre *ngIf="log.data" class="log-data">{{ log.data | json }}</pre>
            </td>
          </tr>
        </tbody>
      </nz-table>
    </div>
  `,
  styles: [
    `
      .console-monitor {
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      .toolbar {
        padding: 8px;
        border-bottom: 1px solid #f0f0f0;
      }
      .log-message {
        white-space: pre-wrap;
        word-break: break-all;
      }
      .log-data {
        margin-top: 8px;
        background: #f5f5f5;
        padding: 8px;
        border-radius: 4px;
        overflow: auto;
      }
      .log-info {
        color: #1890ff;
      }
      .log-warn {
        color: #faad14;
      }
      .log-error {
        color: #ff4d4f;
      }
      .log-debug {
        color: #722ed1;
      }
      .log-success {
        color: #52c41a;
      }
    `,
  ],
})
export class ConsoleMonitorComponent implements OnInit, OnDestroy {
  logs: LogEntry[] = [];
  private subscription?: Subscription;

  constructor(private wsService: WebSocketService) {}

  ngOnInit() {
    this.subscription = this.wsService.messages$.subscribe((message) => {
      if (!message) return;

      console.log('Received message in ConsoleMonitor:', message);

      // Handle both stdout messages and messages with level property
      if (message.type === 'stdout' || message.level) {
        const logEntry: LogEntry = {
          timestamp: message.timestamp || new Date().toISOString(),
          level: message.level || 'info',
          message: message.message || '',
          data: message.data,
        };
        console.log('Adding log entry:', logEntry);
        this.logs = [logEntry, ...this.logs];
      }
    });
  }

  formatMessage(message: string): string {
    if (!message) return '';
    return message
      .replace(/\u001b\[32m/g, '<span class="log-success">')
      .replace(/\u001b\[31m/g, '<span class="log-error">')
      .replace(/\u001b\[33m/g, '<span class="log-warn">')
      .replace(/\u001b\[34m/g, '<span class="log-info">')
      .replace(/\u001b\[35m/g, '<span class="log-debug">')
      .replace(/\u001b\[38;5;3m/g, '<span class="log-warn">')
      .replace(/\u001b\[39m/g, '</span>')
      .replace(/\u001b\[0m/g, '</span>')
      .replace(/\n/g, '<br>');
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  clearLogs() {
    this.logs = [];
  }

  getLevelColor(level: string): string {
    const colors: Record<string, string> = {
      info: 'blue',
      warn: 'orange',
      error: 'red',
      debug: 'purple',
    };
    return colors[level] || 'default';
  }
}
