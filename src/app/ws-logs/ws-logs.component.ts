import { Component } from '@angular/core';
import {Observable} from 'rxjs';
import {WsLoggerService} from '../services/ws-logger.service';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-ws-logs',
  imports: [
    AsyncPipe
  ],
  templateUrl: './ws-logs.component.html',
  styleUrl: './ws-logs.component.css',
  standalone: true,
})
export class WsLogsComponent {
  messages$!: Observable<string[]>;

  constructor(public logService: WsLoggerService) {}

  ngOnInit(): void {
    this.messages$ = this.logService.getMessages$();
  }}
