import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { recepcionistaGuard } from './recepcionista.guard';

describe('recepcionistaGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => recepcionistaGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
