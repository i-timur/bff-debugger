import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { interval, Subscription } from 'rxjs';
import {
  NetworkActivityService,
  NetworkRequest,
} from '../../services/network-activity.service';

@Component({
  selector: 'app-network-monitor',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzDividerModule,
    NzIconModule,
  ],
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
            <th nzWidth="60px"></th>
            <th>Method</th>
            <th>URL</th>
            <th>Status</th>
            <th>Time</th>
            <th>State</th>
          </tr>
        </thead>
        <tbody>
          <ng-container *ngFor="let request of networkTable.data">
            <tr>
              <td [nzExpand]="false" (click)="onExpandChange(request)">
                <span
                  nz-icon
                  [nzType]="expandSet.has(request.id) ? 'minus' : 'plus'"
                ></span>
              </td>
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
            <tr *ngIf="expandSet.has(request.id)">
              <td colspan="6">
                <div class="request-details">
                  <div class="detail-section">
                    <div
                      class="section-header"
                      (click)="togglePayload('headers', request.id)"
                    >
                      <h4>Request Headers</h4>
                      <span
                        nz-icon
                        [nzType]="
                          isPayloadExpanded('headers', request.id)
                            ? 'down'
                            : 'right'
                        "
                      ></span>
                    </div>
                    <pre *ngIf="isPayloadExpanded('headers', request.id)">{{
                      request?.headers | json
                    }}</pre>
                  </div>

                  <div class="detail-section" *ngIf="request?.body">
                    <div
                      class="section-header"
                      (click)="togglePayload('request', request.id)"
                    >
                      <h4>Request Payload</h4>
                      <span
                        nz-icon
                        [nzType]="
                          isPayloadExpanded('request', request.id)
                            ? 'down'
                            : 'right'
                        "
                      ></span>
                    </div>
                    <pre
                      class="payload"
                      *ngIf="isPayloadExpanded('request', request.id)"
                    >
                      {{ formatPayload(request?.body) }}
                    </pre
                    >
                  </div>

                  <div class="detail-section" *ngIf="request?.response">
                    <div
                      class="section-header"
                      (click)="togglePayload('responseHeaders', request.id)"
                    >
                      <h4>Response Headers</h4>
                      <span
                        nz-icon
                        [nzType]="
                          isPayloadExpanded('responseHeaders', request.id)
                            ? 'down'
                            : 'right'
                        "
                      ></span>
                    </div>
                    <pre
                      *ngIf="isPayloadExpanded('responseHeaders', request.id)"
                      >{{ request?.response?.headers | json }}</pre
                    >
                  </div>

                  <div class="detail-section" *ngIf="request?.response?.body">
                    <div
                      class="section-header"
                      (click)="togglePayload('response', request.id)"
                    >
                      <h4>Response Payload</h4>
                      <span
                        nz-icon
                        [nzType]="
                          isPayloadExpanded('response', request.id)
                            ? 'down'
                            : 'right'
                        "
                      ></span>
                    </div>
                    <pre
                      class="payload"
                      *ngIf="isPayloadExpanded('response', request.id)"
                    >
                      {{ formatPayload(request?.response?.body) }}
                    </pre
                    >
                  </div>

                  <div class="detail-section" *ngIf="request?.error">
                    <h4>Error</h4>
                    <pre class="error">{{ request?.error | json }}</pre>
                  </div>
                </div>
              </td>
            </tr>
          </ng-container>
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
      .request-details {
        padding: 16px;
        background: #fafafa;
      }
      .detail-section {
        margin-bottom: 16px;
      }
      .detail-section h4 {
        margin-bottom: 8px;
        color: #666;
      }
      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        padding: 4px 0;
      }
      .section-header:hover {
        background: #f0f0f0;
      }
      .section-header h4 {
        margin: 0;
      }
      .detail-section pre {
        background: #fff;
        padding: 8px;
        border-radius: 4px;
        border: 1px solid #f0f0f0;
        margin: 0;
        overflow: auto;
        max-height: 300px;
      }
      .detail-section pre.payload {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas',
          'source-code-pro', monospace;
        font-size: 13px;
        line-height: 1.5;
        color: #333;
        background: #f8f8f8;
        border: 1px solid #e8e8e8;
      }
      .detail-section pre.error {
        color: #ff4d4f;
        background: #fff2f0;
        border-color: #ffccc7;
      }
    `,
  ],
})
export class NetworkMonitorComponent implements OnInit, OnDestroy {
  requests: NetworkRequest[] = [];
  private subscription?: Subscription;
  private timerSubscription?: Subscription;
  private expandedPayloads: Map<string, boolean> = new Map();
  expandSet = new Set<string>();

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

  onExpandChange(request: NetworkRequest): void {
    if (this.expandSet.has(request.id)) {
      this.expandSet.delete(request.id);
      // Clear all expanded payloads for this request when collapsing
      this.expandedPayloads.delete(`headers-${request.id}`);
      this.expandedPayloads.delete(`request-${request.id}`);
      this.expandedPayloads.delete(`responseHeaders-${request.id}`);
      this.expandedPayloads.delete(`response-${request.id}`);
    } else {
      this.expandSet.add(request.id);
    }
  }

  togglePayload(
    type: 'request' | 'response' | 'headers' | 'responseHeaders',
    requestId: string
  ) {
    const key = `${type}-${requestId}`;
    this.expandedPayloads.set(key, !this.expandedPayloads.get(key));
  }

  isPayloadExpanded(
    type: 'request' | 'response' | 'headers' | 'responseHeaders',
    requestId: string
  ): boolean {
    const key = `${type}-${requestId}`;
    return this.expandedPayloads.get(key) || false;
  }

  formatPayload(payload: any): string {
    if (!payload) return '';
    try {
      if (typeof payload === 'string') {
        // Try to parse if it's a JSON string
        try {
          const parsed = JSON.parse(payload);
          return JSON.stringify(parsed, null, 2);
        } catch {
          // If it's not JSON, return as is
          return payload;
        }
      }
      // If it's already an object, stringify with indentation
      return JSON.stringify(payload, null, 2);
    } catch (error) {
      console.error('Error formatting payload:', error);
      return String(payload);
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
    this.expandedPayloads.clear();
    this.expandSet.clear();
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
