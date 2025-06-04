import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WsLogsComponent } from './ws-logs.component';

describe('WsLogsComponent', () => {
  let component: WsLogsComponent;
  let fixture: ComponentFixture<WsLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WsLogsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WsLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
