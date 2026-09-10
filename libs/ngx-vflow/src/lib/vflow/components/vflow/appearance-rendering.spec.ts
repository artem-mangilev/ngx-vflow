import {
  ChangeDetectionStrategy,
  Component,
  provideZonelessChangeDetection,
  signal,
  viewChildren,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Vflow } from '../../vflow';
import { createNodes } from '../../interfaces/node.interface';
import { createEdges } from '../../interfaces/edge.interface';
import { Background } from '../../types/background.type';
import { VflowComponent } from './vflow.component';
import { MiniMapComponent } from '../../public-components/minimap/minimap.component';

@Component({
  imports: [Vflow],
  template: `
    @for (scene of scenes; track $index) {
      <vflow [view]="[400, 300]" [nodes]="scene.nodes" [edges]="scene.edges" [background]="background()">
        <mini-map />
      </vflow>
    }
  `,
  styles: ':host { display: block; width: 400px; height: 600px; } vflow { height: 300px; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class AppearanceHost {
  readonly minimaps = viewChildren(MiniMapComponent);
  readonly background = signal<Background>({ type: 'dots', gap: 20 });
  readonly scenes = [0, 1].map(() => ({
    nodes: createNodes([
      { id: 'a', type: 'default', point: { x: 20, y: 30 } },
      { id: 'b', type: 'default', point: { x: 200, y: 120 } },
    ]),
    edges: createEdges([{ id: 'edge', source: 'a', target: 'b', markers: { end: {} } }]),
  }));
}

async function settle(fixture: ComponentFixture<AppearanceHost>) {
  fixture.detectChanges();
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  await fixture.whenStable();
}

describe('appearance variables in SVG and canvas', () => {
  let fixture: ComponentFixture<AppearanceHost>;
  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [AppearanceHost], providers: [provideZonelessChangeDetection()] });
    fixture = TestBed.createComponent(AppearanceHost);
    await settle(fixture);
  });

  it('isolates part colors and refreshes canvas without remeasuring graph DOM', async () => {
    const [first, second] = fixture.debugElement.queryAll(By.directive(VflowComponent));
    const editor = first.nativeElement as HTMLElement;
    const other = second.nativeElement as HTMLElement;
    const canvas = editor.querySelector('canvas')!;
    const otherCanvas = other.querySelector('canvas')!;
    const initial = canvas.toDataURL();
    const otherInitial = otherCanvas.toDataURL();
    const probes = Array.from(editor.querySelectorAll('.vflow-node, handle')).map((element) =>
      spyOn(element, 'getBoundingClientRect').and.callThrough(),
    );
    editor.style.cssText = `
      --vflow-background: rgb(1, 2, 3);
      --vflow-background-dot-color: rgb(4, 5, 6);
      --vflow-marker-color: rgb(7, 8, 9);
      --vflow-minimap-mask-color: rgb(10, 11, 12);
      --vflow-minimap-node-fill: rgb(13, 14, 15);
      --vflow-minimap-stroke-color: rgb(16, 17, 18);
    `;
    await settle(fixture);
    expect(canvas.toDataURL()).not.toBe(initial);
    expect(otherCanvas.toDataURL()).toBe(otherInitial);
    expect(getComputedStyle(editor.querySelector('.vflow-root')!).backgroundColor).toBe('rgb(1, 2, 3)');
    expect(getComputedStyle(editor.querySelector('[background] circle')!).fill).toBe('rgb(4, 5, 6)');
    expect(getComputedStyle(editor.querySelector('marker polyline')!).fill).toBe('rgb(7, 8, 9)');
    expect(getComputedStyle(other.querySelector('marker polyline')!).fill).toBe('rgb(177, 177, 183)');
    probes.forEach((probe) => expect(probe).not.toHaveBeenCalled());

    // Stylesheet mutations use the explicit refresh path, not an ancestor-attribute mutation.
    const stylesheet = document.createElement('style');
    stylesheet.textContent = 'vflow { --vflow-minimap-viewport-color: rgb(200, 100, 50); }';
    document.head.append(stylesheet);
    try {
      const beforeRefresh = canvas.toDataURL();
      fixture.componentInstance.minimaps()[0].refreshTheme();
      await settle(fixture);
      expect(canvas.toDataURL()).not.toBe(beforeRefresh);
      probes.forEach((probe) => expect(probe).not.toHaveBeenCalled());
    } finally {
      stylesheet.remove();
    }
  });

  it('scales dot and grid appearance with zoom and keeps marker attachment data unchanged', async () => {
    const first = fixture.debugElement.query(By.directive(VflowComponent));
    const editor = first.nativeElement as HTMLElement;
    editor.style.cssText =
      '--vflow-background-dot-size: 8px; --vflow-background-grid-width: 4px; --vflow-marker-scale: 2; --vflow-marker-stroke-width: 3px;';
    const marker = editor.querySelector('marker')!;
    const markerId = marker.id;
    const arrow = marker.querySelector('polyline')!;
    expect(getComputedStyle(arrow).transform).toBe('matrix(2, 0, 0, 2, 0, 0)');
    expect(getComputedStyle(arrow).strokeWidth).toBe('3px');
    expect(marker.getAttribute('refX')).toBe('0');
    expect(marker.getAttribute('refY')).toBe('0');

    first.componentInstance.viewportTo({ x: 0, y: 0, zoom: 0.5 });
    await settle(fixture);
    const dot = editor.querySelector('[background] circle')!;
    expect(getComputedStyle(dot).r).toBe('2px');
    expect(getComputedStyle(dot).cx).toBe('2px');
    expect(editor.querySelector('pattern')!.getAttribute('width')).toBe('10');
    fixture.componentInstance.background.set({ type: 'grid', size: 30 });
    await settle(fixture);
    expect(getComputedStyle(editor.querySelector('[background] path')!).strokeWidth).toBe('2px');
    expect(editor.querySelector('pattern')!.getAttribute('width')).toBe('15');
    expect(marker.id).toBe(markerId);
    fixture.componentInstance.background.set({ type: 'solid' });
    await settle(fixture);
    expect(editor.querySelector('[background] pattern')).toBeNull();
  });
});
