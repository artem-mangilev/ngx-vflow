import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Vflow } from '../vflow';
import { PanelPosition } from './panel.directive';

const POSITIONS: PanelPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'center-left',
  'center-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .box {
      width: 40px;
      height: 20px;
    }
    .mine {
      margin: 0;
      right: 30px;
    }
  `,
  template: `<vflow style="width: 400px; height: 300px" [style.--v-panel-offset]="offset()" [nodes]="[]">
    @for (position of positions; track position) {
      <div class="box" [vPanel]="position" [attr.data-testid]="position"></div>
    }
    <div class="box" data-testid="moving" [vPanel]="moving()"></div>
    <div class="box mine" data-testid="mine" vPanel="top-right"></div>
    <div class="box" data-testid="unplaced"></div>
  </vflow>`,
})
class PanelHostComponent {
  positions = POSITIONS;
  offset = signal<string | null>(null);
  moving = signal<PanelPosition>('top-left');
}

describe('vPanel', () => {
  async function render() {
    const fixture = TestBed.createComponent(PanelHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const flow = root.querySelector('[data-v-root]')!.getBoundingClientRect();
    /** Left and top of the element against the flow. */
    const place = (id: string) => {
      const rect = root.querySelector(`[data-testid="${id}"]`)!.getBoundingClientRect();
      return [rect.left - flow.left, rect.top - flow.top];
    };
    return { fixture, root, place };
  }

  it('places an element at every corner and side of the flow, 10 pixels from the edge', async () => {
    const { place } = await render();
    // A 40×20 element in a 400×300 flow.
    expect(Object.fromEntries(POSITIONS.map((position) => [position, place(position)]))).toEqual({
      'top-left': [10, 10],
      'top-center': [180, 10],
      'top-right': [350, 10],
      'center-left': [10, 140],
      'center-right': [350, 140],
      'bottom-left': [10, 270],
      'bottom-center': [180, 270],
      'bottom-right': [350, 270],
    });
  });

  it('follows the position, the offset token and the styles of the application', async () => {
    const { fixture, place } = await render();

    fixture.componentInstance.moving.set('bottom-center');
    fixture.componentInstance.offset.set('0px');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(place('moving')).toEqual([180, 280]);
    expect(place('bottom-right')).toEqual([360, 280]);
    // A class of the application wins over the rules of the panel.
    expect(place('mine')).toEqual([330, 0]);
  });

  it('takes the pointer above the pane and leaves an element without it to the application', async () => {
    const { root, place } = await render();
    const panel = root.querySelector('[data-testid="bottom-left"]')!;
    const rect = panel.getBoundingClientRect();

    expect(document.elementFromPoint(rect.left + 5, rect.top + 5)).toBe(panel);
    expect(getComputedStyle(root.querySelector('[data-testid="unplaced"]')!).position).toBe('static');
    expect(place('unplaced')).toEqual([0, 0]);
  });
});
