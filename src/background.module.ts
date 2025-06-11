import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { WebSocketService } from './app/services/websocket.service';

@NgModule({
  imports: [BrowserModule],
  providers: [WebSocketService],
})
export class BackgroundModule {}
