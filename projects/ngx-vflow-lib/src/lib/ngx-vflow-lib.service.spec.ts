import { TestBed } from '@angular/core/testing';

import { NgxVflowLibService } from './ngx-vflow-lib.service';

describe('NgxVflowLibService', () => {
  let service: NgxVflowLibService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxVflowLibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
