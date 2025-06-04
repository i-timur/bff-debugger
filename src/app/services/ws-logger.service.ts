import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WsLoggerService implements OnDestroy {
  private socket: WebSocket | null = null;
  private messagesSubject = new BehaviorSubject<string[]>([]);
  private messages: string[] = [];

  private readonly wsUrl = 'ws://localhost:3000/logs';

  public connect(): void {
    this.socket = new WebSocket(this.wsUrl);

    this.socket.onmessage = (event) => this.addMessage(event.data);
    for (let i = 0; i < 10; i++) {
      setTimeout(() => console.log(i), (i + 1) * 1000);
    }
  }

  private addMessage(message: string): void {
    this.messages.push(message);
    if (this.messages.length > 1000) {
      this.messages.shift();
    }
    this.messagesSubject.next([...this.messages]);
  }

  public getMessages$(): Observable<string[]> {
    return this.messagesSubject.asObservable();
  }

  ngOnDestroy(): void {
    this.socket?.close();
  }
}
