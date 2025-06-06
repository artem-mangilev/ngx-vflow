import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CustomDynamicNodeComponent } from './custom-dynamic-node.component';
import { Vflow } from '../../vflow';
import { VflowMocks, provideCustomNodeMocks } from 'ngx-vflow/testing';

@Component({
  standalone: true,
  template: `<div resizable selectable dragHandle>
    <handle />
  </div>`,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestCustomDynamicNodeComponent extends CustomDynamicNodeComponent {}

describe('TestCustomDynamicNodeComponent', () => {
  let component: TestCustomDynamicNodeComponent;
  let fixture: ComponentFixture<TestCustomDynamicNodeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestCustomDynamicNodeComponent],
      providers: [provideCustomNodeMocks()],
    })
      .overrideComponent(TestCustomDynamicNodeComponent, {
        remove: {
          imports: [Vflow],
        },
        add: {
          imports: [VflowMocks],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(TestCustomDynamicNodeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    // should create without DI errors
    expect(component).toBeTruthy();
  });
});
