import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { createEdge } from '../../interfaces/edge.interface';
import { EdgeModel } from '../../models/edge.model';
import { EdgeComponent } from './edge.component';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { FlowStatusService } from '../../services/flow-status.service';
import { EdgeRenderingService } from '../../services/edge-rendering.service';
import { KeyboardService } from '../../services/keyboard.service';
import { SelectionService } from '../../services/selection.service';
import { RootPointerDirective } from '../../directives/root-pointer.directive';

@Component({
  template: `
    <div rootPointer>
      <svg edge [model]="model" />
    </div>
  `,
  imports: [EdgeComponent, RootPointerDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class EdgeHostComponent {
  public model!: EdgeModel;

  @ViewChild(EdgeComponent)
  public edge!: EdgeComponent;
}

describe('EdgeComponent', () => {
  let fixture: ComponentFixture<EdgeHostComponent>;
  let model: EdgeModel;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EdgeHostComponent],
      providers: [
        EdgeRenderingService,
        FlowEntitiesService,
        FlowSettingsService,
        FlowStatusService,
        KeyboardService,
        SelectionService,
        provideExperimentalZonelessChangeDetection(),
      ],
    });

    model = TestBed.runInInjectionContext(
      () => new EdgeModel(createEdge({ id: 'edge', source: 'source', target: 'target', selectable: true })),
    );
    fixture = TestBed.createComponent(EdgeHostComponent);
    fixture.componentInstance.model = model;
    fixture.detectChanges();
  });

  it('should not select an edge through its pointer target when it is ineligible', () => {
    model.edge.selectable!.set(false);

    (fixture.nativeElement.querySelector('.interactive-edge') as Element).dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    );

    expect(model.selected()).toBeFalse();
  });

  it('should select an eligible edge through its pointer target', () => {
    (fixture.nativeElement.querySelector('.interactive-edge') as Element).dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    );

    expect(model.selected()).toBeTrue();
  });
});
