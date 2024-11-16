import { Component } from "@angular/core";
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CustomDynamicNodeComponent } from "./custom-dynamic-node.component";
import { provideCustomNodeMocks } from "../../testing-utils/provide-custom-node-mocks";
import { VflowModule } from "../../vflow.module";

@Component({
  standalone: true,
  template: `<div resizable selectable>
    <handle />
  </div>`,
  imports: [VflowModule]
})
class TestCustomDynamicNodeComponent extends CustomDynamicNodeComponent { }

describe(('TestCustomDynamicNodeComponent'), () => {
  let component: TestCustomDynamicNodeComponent;
  let fixture: ComponentFixture<TestCustomDynamicNodeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestCustomDynamicNodeComponent],
      providers: [provideCustomNodeMocks()]
    });

    fixture = TestBed.createComponent(TestCustomDynamicNodeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    // should create without DI errors
    expect(component).toBeTruthy();
  });
})
