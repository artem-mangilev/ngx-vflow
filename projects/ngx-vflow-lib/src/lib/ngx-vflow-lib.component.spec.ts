import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxVflowLibComponent } from './ngx-vflow-lib.component';

describe('NgxVflowLibComponent', () => {
  let component: NgxVflowLibComponent;
  let fixture: ComponentFixture<NgxVflowLibComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NgxVflowLibComponent]
    });
    fixture = TestBed.createComponent(NgxVflowLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
