/// <reference types="chrome" />
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface NetworkEvent {
  type: 'requestStarted' | 'requestEnded' | 'requestFailed' | 'stdout';
  requestId: string;
  url?: string;
  method?: string;
  status?: number;
  timestamp?: string;
  timing?: {
    startTime: number;
    endTime: number;
    duration: number;
  };
  data?: any;
  message?: string;
  level?: 'info' | 'warn' | 'error' | 'debug';
}

interface ChromeMessage {
  type: 'CONNECT' | 'DISCONNECT' | 'WEBSOCKET_MESSAGE';
  url?: string;
  data?: NetworkEvent;
}

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private messagesSubject = new BehaviorSubject<NetworkEvent | null>(null);
  public messages$ = this.messagesSubject.asObservable();
  private ws: WebSocket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000;

  constructor() {
    this.connect();
  }

  connect(url: string = 'ws://localhost:3001') {
    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        console.log('WebSocket connection established');
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('WebSocket message received:', message);
          this.messagesSubject.next(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        this.isConnected = false;
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = (event) => {
        this.isConnected = false;
        this.ws = null;

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => {
            this.connect(url);
          }, this.reconnectDelay);
        } else {
          console.error('Max reconnection attempts reached');
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.isConnected = false;
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  sendMessage(message: NetworkEvent) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.isConnected) {
      const messageStr = JSON.stringify(message);
      this.ws.send(messageStr);
    } else {
      console.warn('WebSocket is not ready to send messages');
    }
  }
}
