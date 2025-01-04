import { ChangeDetectionStrategy, Component } from "@angular/core";
import { CustomNodeComponent } from "./custom-node.component";
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideCustomNodeMocks } from "../../testing-utils/provide-custom-node-mocks";
import { Vflow } from "../../vflow";

@Component({
  standalone: true,
  template: `<div resizable selectable dragHandle>
    <handle />
  </div>`,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestCustomNodeComponent extends CustomNodeComponent { }

describe(('TestCustomNodeComponent'), () => {
  let component: TestCustomNodeComponent;
  let fixture: ComponentFixture<TestCustomNodeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestCustomNodeComponent],
      providers: [provideCustomNodeMocks()]
    });

    fixture = TestBed.createComponent(TestCustomNodeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    // should create without DI errors
    expect(component).toBeTruthy();
  });
})
