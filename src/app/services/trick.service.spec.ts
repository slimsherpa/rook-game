import { TestBed } from '@angular/core/testing';

import { TrickService } from './trick.service';

describe('TrickService', () => {
  let service: TrickService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrickService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
