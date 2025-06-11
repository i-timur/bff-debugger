import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { interval, Subscription } from 'rxjs';
import {
  NetworkActivityService,
  NetworkRequest,
} from '../../services/network-activity.service';

@Component({
  selector: 'app-network-monitor',
  standalone: true,
  imports: [CommonModule, NzTableModule, NzTagModule, NzButtonModule],
  template: `
    <div class="network-monitor">
      <div class="toolbar">
        <button nz-button nzType="primary" (click)="clearRequests()">
          Clear
        </button>
      </div>

      <nz-table
        #networkTable
        tableScroll="scroll"
        [nzData]="requests"
        [nzScroll]="{ y: 'calc(100vh - 500px)' }"
        [nzShowPagination]="false"
        [nzFrontPagination]="false"
      >
        <thead>
          <tr>
            <th>Method</th>
            <th>URL</th>
            <th>Status</th>
            <th>Time</th>
            <th>State</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let request of networkTable.data">
            <td>{{ request.method }}</td>
            <td>{{ request.url }}</td>
            <td>
              <nz-tag [nzColor]="getStatusColor(request)">
                {{ request.response?.statusCode || '-' }}
              </nz-tag>
            </td>
            <td>{{ getDuration(request) }}ms</td>
            <td>
              <nz-tag [nzColor]="getStateColor(request.state)">
                {{ request.state }}
              </nz-tag>
            </td>
          </tr>
        </tbody>
      </nz-table>
    </div>
  `,
  styles: [
    `
      .network-monitor {
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      .toolbar {
        padding: 8px;
        border-bottom: 1px solid #f0f0f0;
      }
    `,
  ],
})
export class NetworkMonitorComponent implements OnInit, OnDestroy {
  requests: NetworkRequest[] = [];
  private subscription?: Subscription;
  private timerSubscription?: Subscription;

  constructor(private networkService: NetworkActivityService) {}

  ngOnInit() {
    console.log('NetworkMonitorComponent initialized');
    this.subscription = this.networkService
      .getRequests()
      .subscribe((requestsMap) => {
        console.log('Received requests:', Array.from(requestsMap.values()));
        this.requests = Array.from(requestsMap.values());
      });

    // Start timer to update durations
    this.timerSubscription = interval(100).subscribe(() => {
      this.requests = [...this.requests];
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  getDuration(request: NetworkRequest): number {
    if (request.state === 'pending') {
      return Date.now() - request.timing.startTime;
    }
    return request.timing?.duration || 0;
  }

  clearRequests() {
    this.networkService.clearRequests();
  }

  getStatusColor(request: NetworkRequest): string {
    if (!request.response) return 'default';
    const status = request.response.statusCode;
    if (status >= 200 && status < 300) return 'success';
    if (status >= 300 && status < 400) return 'warning';
    if (status >= 400) return 'error';
    return 'default';
  }

  getStateColor(state: string): string {
    const colors: Record<string, string> = {
      pending: 'processing',
      completed: 'success',
      failed: 'error',
    };
    return colors[state] || 'default';
  }
}
