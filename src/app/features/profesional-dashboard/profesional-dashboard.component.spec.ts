import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfesionalDashboardComponent } from './profesional-dashboard.component';

describe('ProfesionalDashboardComponent', () => {
  let component: ProfesionalDashboardComponent;
  let fixture: ComponentFixture<ProfesionalDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfesionalDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfesionalDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
