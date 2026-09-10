import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Vflow } from '../../vflow';
import { createNodes } from '../../interfaces/node.interface';
import { VflowComponent } from './vflow.component';
import { FlowStatusService } from '../../services/flow-status.service';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { SelectionBoxContextDirective } from '../../directives/selection-box-context.directive';

@Component({
  imports: [Vflow],
  template: `
    <vflow class="feedback-test" [view]="[400, 300]" [nodes]="nodes" [alignmentHelper]="true">
      <ng-template nodeHtml>
        <div resizable style="width: 100px; height: 80px"></div>
      </ng-template>
    </vflow>
  `,
  styles: ':host { display: block; width: 400px; height: 300px; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FeedbackHost {
  readonly nodes = createNodes([
    { id: 'a', type: 'html-template', point: { x: 50, y: 50 } },
    { id: 'b', type: 'html-template', point: { x: 50, y: 180 } },
  ]);
}

describe('public core feedback styling', () => {
  it('inherits part variables without styling internal classes or changing geometry', async () => {
    TestBed.configureTestingModule({
      imports: [FeedbackHost],
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(FeedbackHost);
    const stylesheet = document.createElement('style');
    document.head.append(stylesheet);
    try {
      fixture.detectChanges();
      await fixture.whenStable();
      // ResizeObserver publishes the editor bounds outside Angular stability.
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      const flow = fixture.debugElement.query(By.directive(VflowComponent));
      const entities = flow.injector.get(FlowEntitiesService);
      flow.injector.get(FlowStatusService).status.set({
        state: 'node-drag-start',
        payload: { node: entities.nodes()[0] },
      });
      const selection = fixture.debugElement
        .query(By.directive(SelectionBoxContextDirective))
        .injector.get(SelectionBoxContextDirective).model;
      selection.active.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      const root = fixture.nativeElement as HTMLElement;
      const handle = root.querySelector<HTMLElement>('.resize-control.handle.top.left')!;
      const line = root.querySelector<HTMLElement>('.resize-control.line.top')!;
      const guide = root.querySelector<SVGElement>('[alignmentHelper] line[stroke-dasharray]')!;
      const box = root.querySelector<SVGElement>('.selection-box')!;
      expect(root.querySelectorAll('.resize-control').length).toBe(16);
      expect(getComputedStyle(handle).backgroundColor).toBe('rgb(46, 65, 76)');
      expect(getComputedStyle(line).borderTopColor).toBe('rgb(46, 65, 76)');
      const before = handle.getBoundingClientRect().toJSON();
      const guideX = guide.getAttribute('x1');
      stylesheet.textContent = `
        .feedback-test {
          --vflow-selection: rgb(10, 20, 30);
          --vflow-resize-handle-color: rgb(40, 50, 60);
          --vflow-resize-handle-border-color: rgb(1, 2, 3);
          --vflow-resize-handle-radius: 50%;
          --vflow-resize-line-color: rgb(70, 80, 90);
          --vflow-resize-line-style: dashed;
          --vflow-alignment-guide-color: rgb(100, 110, 120);
          --vflow-alignment-guide-width: 3;
          --vflow-alignment-guide-center-dash: 8 2;
          --vflow-selection-box-fill-opacity: 0.25;
          --vflow-selection-box-stroke-width: 2;
        }
      `;
      expect(getComputedStyle(handle).backgroundColor).toBe('rgb(40, 50, 60)');
      expect(getComputedStyle(handle).borderColor).toBe('rgb(1, 2, 3)');
      expect(getComputedStyle(handle).borderRadius).toBe('50%');
      expect(getComputedStyle(line).borderTopColor).toBe('rgb(70, 80, 90)');
      expect(getComputedStyle(line).borderTopStyle).toBe('dashed');
      expect(getComputedStyle(guide).stroke).toBe('rgb(100, 110, 120)');
      expect(getComputedStyle(guide).strokeWidth).toBe('3px');
      expect(getComputedStyle(guide).strokeDasharray).toBe('8px, 2px');
      expect(getComputedStyle(box).fill).toBe('rgb(10, 20, 30)');
      expect(getComputedStyle(box).fillOpacity).toBe('0.25');
      expect(getComputedStyle(box).strokeWidth).toBe('2px');
      expect(handle.getBoundingClientRect().toJSON()).toEqual(before);
      expect(guide.getAttribute('x1')).toBe(guideX);
    } finally {
      stylesheet.remove();
      fixture.destroy();
    }
  });
});
