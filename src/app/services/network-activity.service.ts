import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Observable } from 'rxjs';
import { WebSocketService, NetworkEvent } from './websocket.service';

export interface NetworkRequest {
  id: string;
  method: string;
  url: string;
  headers: any;
  body: any;
  timestamp: string;
  state: 'pending' | 'completed' | 'failed';
  timing: {
    startTime: number;
    endTime: number;
    duration: number;
    dnsStart?: number;
    dnsEnd?: number;
    connectStart?: number;
    connectEnd?: number;
    sslStart?: number;
    sslEnd?: number;
    sendStart?: number;
    sendEnd?: number;
    receiveHeadersStart?: number;
    receiveHeadersEnd?: number;
    receiveBodyStart?: number;
    receiveBodyEnd?: number;
  };
  response?: {
    statusCode: number;
    headers: any;
    body: any;
  };
  error?: {
    error: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class NetworkActivityService {
  private requestsSubject = new BehaviorSubject<Map<string, NetworkRequest>>(
    new Map()
  );
  public requests$ = this.requestsSubject.asObservable();

  constructor(private wsService: WebSocketService) {
    this.wsService.messages$
      .pipe(filter((event): event is NetworkEvent => !!event))
      .subscribe({
        next: (event) => {
          console.log('NetworkActivityService received event:', event);
          this.handleNetworkEvent(event);
        },
        error: (error) => console.error('NetworkActivityService error:', error),
      });
  }

  private handleNetworkEvent(event: NetworkEvent): void {
    const currentRequests = new Map(this.requestsSubject.value);

    switch (event.type) {
      case 'requestStarted':
        if (event.data?.request) {
          const request = event.data.request;
          console.log('Processing requestStarted:', request);
          const newRequest: NetworkRequest = {
            id: request.id,
            method: request.method,
            url: request.url,
            headers: request.headers,
            body: request.body,
            timestamp: request.timestamp,
            state: 'pending',
            timing: {
              startTime: request.timing.startTime,
              endTime: request.timing.endTime,
              duration: request.timing.endTime - request.timing.startTime,
              dnsStart: request.timing.dnsStart,
              dnsEnd: request.timing.dnsEnd,
              connectStart: request.timing.connectStart,
              connectEnd: request.timing.connectEnd,
              sslStart: request.timing.sslStart,
              sslEnd: request.timing.sslEnd,
              sendStart: request.timing.sendStart,
              sendEnd: request.timing.sendEnd,
              receiveHeadersStart: request.timing.receiveHeadersStart,
              receiveHeadersEnd: request.timing.receiveHeadersEnd,
              receiveBodyStart: request.timing.receiveBodyStart,
              receiveBodyEnd: request.timing.receiveBodyEnd,
            },
          };
          currentRequests.set(request.id, newRequest);
          console.log(
            'Current requests after adding:',
            Array.from(currentRequests.entries())
          );
        }
        break;

      case 'requestEnded':
        if (event.data?.request && event.data?.response) {
          const request = event.data.request;
          const response = event.data.response;
          console.log('Processing requestEnded:', { request, response });
          const existingRequest = currentRequests.get(request.id);

          if (existingRequest) {
            const updatedRequest: NetworkRequest = {
              ...existingRequest,
              state: 'completed',
              timing: {
                startTime: request.timing.startTime,
                endTime: request.timing.endTime,
                duration: request.timing.endTime - request.timing.startTime,
                dnsStart: request.timing.dnsStart,
                dnsEnd: request.timing.dnsEnd,
                connectStart: request.timing.connectStart,
                connectEnd: request.timing.connectEnd,
                sslStart: request.timing.sslStart,
                sslEnd: request.timing.sslEnd,
                sendStart: request.timing.sendStart,
                sendEnd: request.timing.sendEnd,
                receiveHeadersStart: request.timing.receiveHeadersStart,
                receiveHeadersEnd: request.timing.receiveHeadersEnd,
                receiveBodyStart: request.timing.receiveBodyStart,
                receiveBodyEnd: request.timing.receiveBodyEnd,
              },
              response: {
                statusCode: response.statusCode,
                headers: response.headers,
                body: response.body,
              },
            };
            currentRequests.set(request.id, updatedRequest);
            console.log(
              'Current requests after updating:',
              Array.from(currentRequests.entries())
            );
          } else {
            // If we receive a requestEnded without a requestStarted, create a new request
            const newRequest: NetworkRequest = {
              id: request.id,
              method: request.method,
              url: request.url,
              headers: request.headers,
              body: request.body,
              timestamp: request.timestamp,
              state: 'completed',
              timing: {
                startTime: request.timing.startTime,
                endTime: request.timing.endTime,
                duration: request.timing.endTime - request.timing.startTime,
                dnsStart: request.timing.dnsStart,
                dnsEnd: request.timing.dnsEnd,
                connectStart: request.timing.connectStart,
                connectEnd: request.timing.connectEnd,
                sslStart: request.timing.sslStart,
                sslEnd: request.timing.sslEnd,
                sendStart: request.timing.sendStart,
                sendEnd: request.timing.sendEnd,
                receiveHeadersStart: request.timing.receiveHeadersStart,
                receiveHeadersEnd: request.timing.receiveHeadersEnd,
                receiveBodyStart: request.timing.receiveBodyStart,
                receiveBodyEnd: request.timing.receiveBodyEnd,
              },
              response: {
                statusCode: response.statusCode,
                headers: response.headers,
                body: response.body,
              },
            };
            currentRequests.set(request.id, newRequest);
            console.log('Created new request from requestEnded:', newRequest);
          }
        }
        break;

      case 'requestFailed':
        if (event.data?.request) {
          const request = event.data.request;
          const existingRequest = currentRequests.get(request.id);

          if (existingRequest) {
            const updatedRequest: NetworkRequest = {
              ...existingRequest,
              state: 'failed',
              error: event.data.error || { error: 'Unknown error' },
            };
            currentRequests.set(request.id, updatedRequest);
          }
        }
        break;
    }

    this.requestsSubject.next(currentRequests);
  }

  public getRequests(): Observable<Map<string, NetworkRequest>> {
    return this.requests$;
  }

  public clearRequests(): void {
    this.requestsSubject.next(new Map());
  }
}
