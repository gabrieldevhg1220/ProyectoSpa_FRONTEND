import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecepcionistaDashboardComponent } from './recepcionista-dashboard.component';

describe('RecepcionistaDashboardComponent', () => {
  let component: RecepcionistaDashboardComponent;
  let fixture: ComponentFixture<RecepcionistaDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecepcionistaDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecepcionistaDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
