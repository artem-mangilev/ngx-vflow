import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Vflow } from '../../vflow';
import { createNodes } from '../../interfaces/node.interface';
import { provideVflow } from '../../features/feature';
import { withNodeComponents } from '../../features/with-entity-components';
import { withMinimapSettings } from '../../features/with-minimap-settings';

@Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class TaskNodeComponent {}

const DEFAULT = [226, 226, 226, 255];
const GREEN = [0, 128, 0, 255];
const RED = [255, 0, 0, 255];

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideVflow(
      withNodeComponents({ task: TaskNodeComponent }),
      withMinimapSettings({ nodeStyles: { task: { background: 'rgb(0, 128, 0)' } } }),
    ),
  ],
  styles: `
    .light {
      --brand: rgb(0, 0, 255);
    }
    .dark {
      --brand: rgb(255, 255, 0);
      --v-minimap-node: rgb(10, 20, 30);
    }
  `,
  template: `<div [class]="theme()" [style.display]="hidden() ? 'none' : null">
    <vflow style="width: 400px; height: 300px" [nodes]="nodes()">
      <v-minimap vPanel="bottom-right" />
    </vflow>
  </div>`,
})
class StyledNodesHostComponent {
  theme = signal<'light' | 'dark'>('light');
  hidden = signal(false);
  // Every node is inside the viewport, so the mask covers none of them and a pixel is the color the node was painted.
  nodes = signal(
    createNodes([
      { id: 'plain', point: { x: 0, y: 0 }, width: 90, height: 60 },
      { id: 'task', component: 'task', point: { x: 120, y: 0 }, width: 90, height: 60 },
      {
        id: 'own',
        component: 'task',
        point: { x: 240, y: 0 },
        width: 90,
        height: 60,
        minimap: { background: 'rgb(255, 0, 0)' },
      },
      { id: 'token', point: { x: 0, y: 100 }, width: 90, height: 60, minimap: { background: 'var(--brand)' } },
      { id: 'group', point: { x: 120, y: 100 }, width: 240, height: 150 },
      { id: 'member', parentId: 'group', point: { x: 20, y: 20 }, width: 90, height: 60 },
    ]),
  );
}

describe('minimap node styles', () => {
  let fixture: ComponentFixture<StyledNodesHostComponent>;
  let host: StyledNodesHostComponent;
  let canvas: HTMLCanvasElement;

  /** A change of a computed color is reported in the frame after the styles are computed again. */
  async function settle() {
    fixture.detectChanges();
    for (let i = 0; i < 4; i++) await new Promise(requestAnimationFrame);
    await fixture.whenStable();
  }

  beforeEach(async () => {
    fixture = TestBed.createComponent(StyledNodesHostComponent);
    host = fixture.componentInstance;
    await settle();
    canvas = fixture.nativeElement.querySelector('canvas');
  });

  /** The pixel of the canvas at a flow point. The nodes are in view, so the minimap shows exactly the viewport. */
  function pixel(x: number, y: number): number[] {
    const { width, height } = canvas.getBoundingClientRect();
    const zoom = Math.min((width - 10) / 400, (height - 10) / 300);
    const ratio = canvas.width / width;
    const left = (width / 2 - 200 * zoom + x * zoom) * ratio;
    const top = (height / 2 - 150 * zoom + y * zoom) * ratio;
    return [...canvas.getContext('2d')!.getImageData(Math.floor(left), Math.floor(top), 1, 1).data];
  }

  it('paints the default, then the style of the component, then the style of the node', () => {
    expect(pixel(45, 30)).toEqual(DEFAULT);
    expect(pixel(165, 30)).toEqual(GREEN);
    expect(pixel(285, 30)).toEqual(RED);
    // Between the nodes only the background of the element shows.
    expect(pixel(105, 30)[3]).toBe(0);
  });

  it('fills nodes without a style with the token, under the component and the node', async () => {
    host.theme.set('dark');
    await settle();

    expect(pixel(45, 30)).toEqual([10, 20, 30, 255]);
    expect(pixel(165, 30)).toEqual(GREEN);
    expect(pixel(285, 30)).toEqual(RED);
  });

  it('draws a node with children as an outline in the color of nodes, with its members inside', async () => {
    // The middle of the group, outside its member, is not painted.
    expect(pixel(300, 220)[3]).toBe(0);
    expect(pixel(175, 150)).toEqual(DEFAULT);
    // The outline is one CSS pixel wide on the left edge of the group; it is not aligned to the pixel grid.
    expect(pixel(120, 220)[3]).toBeGreaterThan(100);
    expect(pixel(120, 220)[0]).toBeGreaterThan(200);

    host.theme.set('dark');
    await settle();
    expect(pixel(300, 220)[3]).toBe(0);
    expect(pixel(120, 220)[3]).toBeGreaterThan(100);
    expect(pixel(120, 220)[0]).toBeLessThan(40);

    // The node gets its signal later; the flow reads it with the next array. Its own style is taken as written.
    host.nodes().find((node) => node.id === 'group')!.minimap = signal({ background: 'rgb(1, 2, 3)' });
    host.nodes.update((nodes) => [...nodes]);
    await settle();
    expect(pixel(300, 220)).toEqual([1, 2, 3, 255]);
    expect(pixel(175, 150)).toEqual([10, 20, 30, 255]);
  });

  it('draws a border in pixels of the minimap and rounds the corners', async () => {
    const own = host.nodes()[2].minimap!;
    own.set({ background: 'rgb(255, 0, 0)', borderColor: 'rgb(0, 0, 0)', borderWidth: 2 });
    await settle();
    // 2 CSS pixels of the minimap are 7.5 flow units here, centered on the edge: black there, the fill in the middle.
    expect(pixel(241, 30)).toEqual([0, 0, 0, 255]);
    expect(pixel(285, 30)).toEqual(RED);

    own.set({ background: 'rgb(255, 0, 0)', borderRadius: 999 });
    await settle();
    // A radius beyond half the shorter side is a pill: the corner of the rectangle is empty.
    expect(pixel(242, 2)[3]).toBe(0);
    expect(pixel(285, 30)).toEqual(RED);
  });

  it('resolves var() on the minimap and repaints when the theme of an ancestor changes', async () => {
    expect(pixel(45, 130)).toEqual([0, 0, 255, 255]);

    host.theme.set('dark');
    await settle();
    expect(pixel(45, 130)).toEqual([255, 255, 0, 255]);
  });

  it('keeps painting a node that is moved beyond the bounds the minimap showed', async () => {
    // Far outside the viewport: the minimap now shows x 0…2090 and y 0…1260, and the node is 5 by 3 pixels of it.
    host.nodes()[0].point.set({ x: 2000, y: 1200 });
    await settle();

    const { width, height } = canvas.getBoundingClientRect();
    const zoom = Math.min((width - 10) / 2090, (height - 10) / 1260);
    const ratio = canvas.width / width;
    const left = (width / 2 + (2045 - 1045) * zoom) * ratio;
    const top = (height / 2 + (1230 - 630) * zoom) * ratio;
    const painted = canvas.getContext('2d')!.getImageData(Math.floor(left), Math.floor(top), 1, 1).data;
    // Opaque under the translucent mask: the node is there.
    expect(painted[3]).toBe(255);
  });

  it('follows a color changed by a stylesheet alone, also where the application turns transitions off', async () => {
    const style = document.createElement('style');
    style.textContent = '* { transition: none !important } .light { --brand: rgb(0, 200, 0) !important }';
    document.head.append(style);
    try {
      await settle();
      expect(pixel(45, 130)).toEqual([0, 200, 0, 255]);
    } finally {
      style.remove();
    }
    await settle();
    expect(pixel(45, 130)).toEqual([0, 0, 255, 255]);
  });

  it('paints the colors of the theme that was set while the flow was hidden', async () => {
    host.hidden.set(true);
    await settle();
    host.theme.set('dark');
    await settle();
    host.hidden.set(false);
    await settle();

    expect(pixel(45, 130)).toEqual([255, 255, 0, 255]);
    expect(pixel(45, 30)).toEqual([10, 20, 30, 255]);
  });

  it('keeps its transition events from the listeners of the application', async () => {
    const heard = vi.fn();
    fixture.nativeElement.addEventListener('transitionrun', heard);
    fixture.nativeElement.addEventListener('transitionend', heard);
    host.theme.set('dark');
    await settle();

    expect(pixel(45, 130)).toEqual([255, 255, 0, 255]);
    expect(heard).not.toHaveBeenCalled();
  });

  it('paints nothing again when an attribute of an ancestor changes and the colors stay the same', async () => {
    const fill = vi.spyOn(CanvasRenderingContext2D.prototype, 'fill');
    fixture.nativeElement.setAttribute('data-unrelated', 'value');
    await settle();

    expect(fill).not.toHaveBeenCalled();
  });

  it('follows a style the node sets later', async () => {
    host.nodes()[2].minimap!.set({ background: 'rgb(9, 9, 9)' });
    await settle();
    expect(pixel(285, 30)).toEqual([9, 9, 9, 255]);
  });
});

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideVflow(
      withNodeComponents({ task: TaskNodeComponent }),
      withMinimapSettings({ nodeStyles: { task: { borderRadius: 4 }, tsak: { background: 'red' } } }),
    ),
  ],
  template: `<vflow style="width: 400px; height: 300px" [nodes]="[]"><v-minimap /></vflow>`,
})
class UnknownKeyHostComponent {}

describe('withMinimapSettings()', () => {
  it('warns once about a key no node component is registered under', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fixture = TestBed.createComponent(UnknownKeyHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('"tsak"');
  });
});
