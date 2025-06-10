import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEmpleadosComponent } from './admin-empleados.component';

describe('AdminEmpleadosComponent', () => {
  let component: AdminEmpleadosComponent;
  let fixture: ComponentFixture<AdminEmpleadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminEmpleadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEmpleadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
