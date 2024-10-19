import { Component } from "@angular/core";
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CustomDynamicNodeComponent } from "./custom-dynamic-node.component";

@Component({
  standalone: true,
  template: ``,
})
class TestCustomDynamicNodeComponent extends CustomDynamicNodeComponent { }

describe(('TestCustomDynamicNodeComponent'), () => {
  let component: TestCustomDynamicNodeComponent;
  let fixture: ComponentFixture<TestCustomDynamicNodeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestCustomDynamicNodeComponent],
    });

    fixture = TestBed.createComponent(TestCustomDynamicNodeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    // should create without DI errors
    expect(component).toBeTruthy();
  });
})
