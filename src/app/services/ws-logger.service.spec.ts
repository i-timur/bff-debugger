import { TestBed } from '@angular/core/testing';

import { WsLoggerService } from './ws-logger.service';

describe('WsLoggerService', () => {
  let service: WsLoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WsLoggerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
