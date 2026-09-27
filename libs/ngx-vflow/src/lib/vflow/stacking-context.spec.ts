import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Vflow } from './vflow';
import { createNodes } from './interfaces/node.interface';

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div data-testid="dialog" style="position: fixed; inset: 0; z-index: 10"></div>
    <div style="position: relative">
      <vflow [view]="[400, 300]" [nodes]="nodes">
        <mini-map [pannable]="true" />
      </vflow>
      <div data-testid="panel" style="position: absolute; left: 0; top: 0; width: 40px; height: 40px"></div>
    </div>
  `,
})
class PageComponent {
  nodes = createNodes([{ id: 'a', point: { x: 0, y: 0 }, width: 100, height: 50 }]);
}

describe('Flow stacking context', () => {
  let fixture: ComponentFixture<PageComponent>;
  let root: HTMLElement;

  const hit = (element: Element) => {
    const rect = element.getBoundingClientRect();
    return document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    fixture = TestBed.createComponent(PageComponent);
    root = fixture.nativeElement;
    fixture.detectChanges();
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    await fixture.whenStable();
  });

  it('keeps the minimap under an overlay of the page', () => {
    const dialog = root.querySelector('[data-testid="dialog"]')!;
    const canvas = root.querySelector('canvas')!;

    // Without the overlay the minimap is the topmost element at its own center.
    dialog.remove();
    expect(hit(canvas)).toBe(canvas);

    root.prepend(dialog);
    expect(hit(canvas)).toBe(dialog);
  });

  it('lets a positioned element after the flow paint above the pane without a z-index', () => {
    root.querySelector('[data-testid="dialog"]')!.remove();
    const panel = root.querySelector('[data-testid="panel"]')!;
    const [x, y] = [panel.getBoundingClientRect().x + 20, panel.getBoundingClientRect().y + 20];

    expect(document.elementsFromPoint(x, y)).toContain(root.querySelector('.vflow-pane')!);
    expect(hit(panel)).toBe(panel);
  });
});
