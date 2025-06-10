import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { profesionalGuard } from './profesional.guard';

describe('profesionalGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => profesionalGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
