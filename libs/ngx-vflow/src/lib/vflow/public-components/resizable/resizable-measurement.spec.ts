import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createNodes } from '../../interfaces/node.interface';
import { Vflow } from '../../vflow';

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <vflow [view]="[600, 500]" [nodes]="nodes">
      <ng-template nodeHtml>
        <div class="surface" [resizable]="false" [style.min-width.px]="minimumWidth()">
          <handle type="source" position="right" />
        </div>
      </ng-template>
    </vflow>
  `,
  styles: `
    .surface {
      width: 100%;
      height: 100%;
      min-height: 320px;
      max-width: 350px;
      border: 2px solid black;
    }
  `,
})
class MeasurementHost {
  readonly minimumWidth = signal(240);
  readonly nodes = createNodes([{ id: 'node', type: 'html-template', point: { x: 0, y: 0 } }]);
}

for (const initialWidth of [undefined, 500]) {
  it(`measures the constrained resizable surface rather than its model-sized wrapper (${initialWidth ?? 'default'} width)`, async () => {
    TestBed.configureTestingModule({ imports: [MeasurementHost], providers: [provideZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(MeasurementHost);
    if (initialWidth !== undefined) fixture.componentInstance.nodes[0].width!.set(initialWidth);
    fixture.detectChanges();
    const settle = async () => {
      await fixture.whenStable();
      await new Promise(requestAnimationFrame);
      await fixture.whenStable();
    };
    await settle();
    const root = fixture.nativeElement as HTMLElement;
    const surface = root.querySelector<HTMLElement>('.surface')!;
    const wrapper = root.querySelector<HTMLElement>('.wrapper')!;
    const assertSize = (width: number) => {
      expect(surface.offsetWidth).toBe(width);
      expect(wrapper.offsetWidth).toBe(width);
      expect(wrapper.offsetHeight).toBe(320);
      const handle = root.querySelector('.handle--right')!.getBoundingClientRect();
      expect(handle.x + handle.width / 2).toBeCloseTo(surface.getBoundingClientRect().right, 1);
    };
    assertSize(initialWidth === undefined ? 240 : 350);
    fixture.componentInstance.minimumWidth.set(420);
    await settle();
    assertSize(420);
    fixture.componentInstance.minimumWidth.set(240);
    await settle();
    assertSize(350);
  });
}
