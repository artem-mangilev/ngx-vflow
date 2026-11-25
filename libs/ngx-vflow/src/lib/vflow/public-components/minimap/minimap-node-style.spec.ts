import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Vflow } from '../../vflow';
import { createNodes } from '../../interfaces/node.interface';
import { MinimapNodeStyle, MinimapNodeStyleRule, MinimapSettings } from '../../interfaces/minimap.interface';
import { Node } from '../../interfaces/node.interface';
import { provideVflow } from '../../features/feature';
import { withNodeComponents } from '../../features/with-entity-components';
import { withMinimap } from '../../features/with-minimap';

/** Stands for every node component of the specs: the minimap reads the key, not the component. */
@Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class TaskNodeComponent {}

const DEFAULT = 'rgb(226, 226, 226)';
const GREEN = 'rgb(0, 128, 0)';
const RED = 'rgb(255, 0, 0)';
const NONE = 'rgba(0, 0, 0, 0)';

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideVflow(
      withNodeComponents({
        task: TaskNodeComponent,
        alert: TaskNodeComponent,
        brand: TaskNodeComponent,
        section: TaskNodeComponent,
      }),
      withMinimap(() => inject(StyledNodesHostComponent).settings),
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
    .tokens {
      --v-minimap-node-border: rgb(0, 0, 0);
      --v-minimap-node-radius: 999px;
      --v-minimap-group: rgb(1, 2, 3);
      --v-minimap-group-border: rgb(250, 0, 0);
    }
  `,
  template: `<div [class]="theme()">
    <vflow style="width: 400px; height: 300px" [nodes]="nodes()">
      <!-- Pannable, so that a point of the minimap hits the path drawn there. -->
      <v-minimap vPanel="bottom-right" [pannable]="true" />
    </vflow>
  </div>`,
})
class StyledNodesHostComponent {
  theme = signal<'light' | 'dark' | 'tokens'>('light');
  settings = signal<MinimapSettings>({
    nodeStyles: {
      task: { background: 'rgb(0, 128, 0)' },
      alert: { background: 'rgb(255, 0, 0)' },
      brand: { background: 'var(--brand)' },
    },
  });
  // Every node is inside the viewport, so the minimap shows exactly the viewport.
  nodes = signal(
    createNodes([
      { id: 'plain', point: { x: 0, y: 0 }, width: 90, height: 60 },
      { id: 'task', component: 'task', point: { x: 120, y: 0 }, width: 90, height: 60 },
      { id: 'alert', component: 'alert', point: { x: 240, y: 0 }, width: 90, height: 60 },
      { id: 'brand', component: 'brand', point: { x: 0, y: 100 }, width: 90, height: 60 },
      { id: 'group', component: 'section', point: { x: 120, y: 100 }, width: 240, height: 150 },
      { id: 'member', parentId: 'group', point: { x: 20, y: 20 }, width: 90, height: 60 },
    ]),
  );

  /** Gives a component another rule, as an application that keeps its settings in a signal does. */
  style(key: string, rule: MinimapNodeStyleRule) {
    this.settings.update(({ nodeStyles }) => ({ nodeStyles: { ...nodeStyles, [key]: rule } }));
  }
}

describe('minimap node styles', () => {
  let fixture: ComponentFixture<StyledNodesHostComponent>;
  let host: StyledNodesHostComponent;

  async function settle() {
    fixture.detectChanges();
    for (let i = 0; i < 2; i++) await new Promise(requestAnimationFrame);
    await fixture.whenStable();
  }

  beforeEach(async () => {
    fixture = TestBed.createComponent(StyledNodesHostComponent);
    host = fixture.componentInstance;
    await settle();
  });

  /** The path the minimap draws at a flow point, when the minimap shows the flow from 0…`width` by 0…`height`. */
  function pathAt(x: number, y: number, [width, height] = [400, 300]): SVGPathElement | null {
    const box = fixture.nativeElement.querySelector('v-minimap svg').getBoundingClientRect();
    const zoom = Math.min((box.width - 10) / width, (box.height - 10) / height);
    const hit = document.elementFromPoint(
      box.left + box.width / 2 + (x - width / 2) * zoom,
      box.top + box.height / 2 + (y - height / 2) * zoom,
    );
    return hit instanceof SVGPathElement ? hit : null;
  }

  const fill = (x: number, y: number) => getComputedStyle(pathAt(x, y)!).fill;
  const stroke = (x: number, y: number) => getComputedStyle(pathAt(x, y)!).stroke;

  it('fills a node without a style with the token', () => {
    expect(fill(45, 30)).toBe(DEFAULT);
  });

  it('fills the nodes of a component with the style of its key', () => {
    expect(fill(165, 30)).toBe(GREEN);
    expect(fill(285, 30)).toBe(RED);
  });

  it('draws nothing between the nodes', () => {
    expect(pathAt(105, 30)).toBeNull();
  });

  it('follows a theme that changes the node token, and keeps the style of a component', async () => {
    host.theme.set('dark');
    await settle();

    expect(fill(45, 30)).toBe('rgb(10, 20, 30)');
    expect(fill(165, 30)).toBe(GREEN);
  });

  it('draws a node with children as an outline in the color of nodes', async () => {
    expect(fill(300, 220)).toBe(NONE);
    expect(stroke(300, 220)).toBe(DEFAULT);

    host.theme.set('dark');
    await settle();
    expect(stroke(300, 220)).toBe('rgb(10, 20, 30)');
  });

  it('draws the members of a group above it', () => {
    expect(fill(175, 150)).toBe(DEFAULT);
    expect(pathAt(175, 150)).not.toBe(pathAt(300, 220));
  });

  it('takes the style of the component of a group as written, a fill included', async () => {
    host.style('section', { background: 'rgb(1, 2, 3)' });
    await settle();

    expect(fill(300, 220)).toBe('rgb(1, 2, 3)');
    expect(fill(175, 150)).toBe(DEFAULT);
  });

  it('draws an outline one pixel of the minimap wide where its color is set', async () => {
    host.style('alert', { background: 'rgb(255, 0, 0)', borderColor: 'rgb(0, 0, 0)' });
    await settle();

    const path = getComputedStyle(pathAt(285, 30)!);
    expect([path.stroke, path.strokeWidth, path.vectorEffect]).toEqual(['rgb(0, 0, 0)', '1px', 'non-scaling-stroke']);
  });

  it('rounds the corners by the radius of a style, up to a pill', async () => {
    host.style('alert', { background: 'rgb(255, 0, 0)', borderRadius: 999 });
    await settle();

    // A radius beyond half the shorter side is a pill: the corner of the rectangle is empty.
    expect(pathAt(242, 2)).toBeNull();
    expect(fill(285, 30)).toBe(RED);
  });

  it('resolves var() where the minimap is and follows the theme of an ancestor', async () => {
    expect(fill(45, 130)).toBe('rgb(0, 0, 255)');

    host.theme.set('dark');
    await settle();
    expect(fill(45, 130)).toBe('rgb(255, 255, 0)');
  });

  it('keeps drawing a node that is moved beyond the bounds the minimap showed', async () => {
    host.nodes()[0].point.set({ x: 2000, y: 1200 });
    await settle();

    // The minimap now shows x 0…2090 and y 0…1260.
    expect(getComputedStyle(pathAt(2045, 1230, [2090, 1260])!).fill).toBe(DEFAULT);
  });

  it('draws every node and every group by the tokens, under the style of a component', async () => {
    host.theme.set('tokens');
    // The radius token is read when the paths are built, with a change of the graph.
    host.nodes.set([...host.nodes()]);
    await settle();

    // A node without a component: an outline in the token color, and a radius that makes it a pill.
    expect(stroke(45, 30)).toBe('rgb(0, 0, 0)');
    expect(fill(45, 30)).toBe(DEFAULT);
    expect(pathAt(2, 2)).toBeNull();
    // A component keeps its fill and takes the outline and the radius it does not set.
    expect(fill(165, 30)).toBe(GREEN);
    expect(stroke(165, 30)).toBe('rgb(0, 0, 0)');
    expect(pathAt(122, 2)).toBeNull();
    // The group has its own fill and outline, and the radius of nodes.
    expect(fill(300, 220)).toBe('rgb(1, 2, 3)');
    expect(stroke(300, 220)).toBe('rgb(250, 0, 0)');
    expect(pathAt(122, 102)).toBeNull();
  });

  describe('a style rule of a function', () => {
    const failed: MinimapNodeStyle = { background: 'rgb(200, 0, 0)' };
    let rule: ReturnType<typeof vi.fn<(node: Node) => MinimapNodeStyle | undefined>>;

    beforeEach(async () => {
      rule = vi.fn((node: Node) => ((node.data?.() as { failed?: boolean }).failed ? failed : undefined));
      host.style('task', rule);
      await settle();
    });

    it('is asked once per node of its component, and without a style the node takes the tokens', () => {
      expect(rule).toHaveBeenCalledTimes(1);
      expect(fill(165, 30)).toBe(DEFAULT);
    });

    it('is not asked again while the node moves', async () => {
      host.nodes()[1].point.set({ x: 125, y: 5 });
      await settle();

      expect(rule).toHaveBeenCalledTimes(1);
    });

    it('derives the style again from data that changes', async () => {
      host.nodes()[1].data.set({ failed: true });
      await settle();

      expect(rule).toHaveBeenCalledTimes(2);
      expect(fill(165, 30)).toBe('rgb(200, 0, 0)');
      expect(fill(285, 30)).toBe(RED);
    });
  });

  it('follows settings that change', async () => {
    host.style('alert', { background: 'rgb(9, 9, 9)' });
    await settle();
    expect(fill(285, 30)).toBe('rgb(9, 9, 9)');
    expect(fill(165, 30)).toBe(GREEN);
  });
});

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideVflow(withMinimap({ nodeStyles: { task: { background: 'rgb(0, 128, 0)' } } }))],
  template: `<vflow style="width: 400px; height: 300px" [nodes]="nodes">
    <v-minimap vPanel="bottom-right" [pannable]="true" />
  </vflow>`,
})
class CloserMinimapHostComponent {
  nodes = createNodes([
    { id: 'plain', point: { x: 0, y: 0 }, width: 90, height: 60 },
    { id: 'task', component: 'task', point: { x: 120, y: 0 }, width: 90, height: 60 },
    { id: 'alert', component: 'alert', point: { x: 240, y: 0 }, width: 90, height: 60 },
    { id: 'corner', point: { x: 310, y: 240 }, width: 90, height: 60 },
  ]);
}

describe('withMinimap() on two levels', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideVflow(
          withNodeComponents({ task: TaskNodeComponent, alert: TaskNodeComponent }),
          withMinimap({
            nodeStyles: {
              task: { background: 'rgb(255, 0, 0)', borderRadius: 999 },
              alert: (node: Node) => (node.id === 'alert' ? { background: 'rgb(0, 0, 255)' } : undefined),
            },
          }),
        ),
      ],
    }),
  );

  async function render() {
    const fixture = TestBed.createComponent(CloserMinimapHostComponent);
    fixture.detectChanges();
    for (let i = 0; i < 2; i++) await new Promise(requestAnimationFrame);
    await fixture.whenStable();
    const box = fixture.nativeElement.querySelector('v-minimap svg').getBoundingClientRect();
    const zoom = Math.min((box.width - 10) / 400, (box.height - 10) / 300);
    return (x: number, y: number) => {
      const hit = document.elementFromPoint(
        box.left + box.width / 2 + (x - 200) * zoom,
        box.top + box.height / 2 + (y - 150) * zoom,
      );
      return hit instanceof SVGPathElement ? hit : null;
    };
  }

  it('replaces the style of a key that the closer level sets, the radius of the level above included', async () => {
    const pathAt = await render();

    expect(getComputedStyle(pathAt(165, 30)!).fill).toBe(GREEN);
    // Without the pill radius of the level above, the corner of the node is drawn.
    expect(pathAt(125, 5)).not.toBeNull();
  });

  it('keeps the keys of the level above that the closer level does not set', async () => {
    const pathAt = await render();

    expect(getComputedStyle(pathAt(285, 30)!).fill).toBe('rgb(0, 0, 255)');
  });
});
