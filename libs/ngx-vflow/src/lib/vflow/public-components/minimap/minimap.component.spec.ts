import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Vflow } from '../../vflow';
import { VflowComponent } from '../../components/vflow/vflow.component';
import { createNodes } from '../../interfaces/node.interface';

/** A component node measures itself; the minimap draws it at the measured size. */
@Component({
  template: `<div style="width: 100px; height: 50px"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PlainNodeComponent {}

@Component({
  template: `<vflow style="width: 400px; height: 300px" [nodes]="nodes" [virtualization]="true"
    ><v-minimap vPanel="bottom-right"
  /></vflow>`,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MinimapHostComponent {
  flow = viewChild.required(VflowComponent);
  nodes = createNodes([
    { id: 'node', component: PlainNodeComponent, point: { x: 0, y: 0 } },
    // Out of the viewport, so virtualization does not render it.
    { id: 'group', point: { x: 1000, y: 0 }, width: 200, height: 100 },
    // A member makes 'group' a parent, which the minimap draws as an outline.
    { id: 'member', parentId: 'group', point: { x: 20, y: 20 }, width: 40, height: 20 },
  ]);
}

describe('VflowMinimapComponent', () => {
  let fixture: ComponentFixture<MinimapHostComponent>;
  let host: MinimapHostComponent;

  async function settle() {
    fixture.detectChanges();
    for (let i = 0; i < 5; i++) await new Promise(requestAnimationFrame);
    await fixture.whenStable();
  }

  beforeEach(async () => {
    fixture = TestBed.createComponent(MinimapHostComponent);
    host = fixture.componentInstance;
    await settle();
  });

  const minimap = () => fixture.nativeElement.querySelector('v-minimap') as HTMLElement;
  const paths = () => Array.from(minimap().querySelectorAll('svg path'), (path) => path.getAttribute('d')).join('');
  const mark = () => minimap().querySelector<HTMLElement>('.v-minimap-viewport')!.getAttribute('style');

  it('draws every node as an SVG path in flow space, the ones virtualization leaves out included', () => {
    // Rounded by the default radius of 2 flow pixels, so a path starts 2 pixels right of the corner.
    expect(paths()).toContain('M2,0h96');
    expect(paths()).toContain('M1002,0h196');
    expect(paths()).toContain('M1022,20h36');
  });

  it('moves the mark of the viewport, not the paths, when the camera moves', async () => {
    const [drawn, marked] = [paths(), mark()];

    await host.flow().setViewport({ x: -200, y: 0, zoom: 0.8 });
    await settle();

    expect(mark()).not.toBe(marked);
    expect(paths()).toBe(drawn);
  });

  it('redraws a node that moves', async () => {
    host.nodes[0].point.set({ x: 50, y: 20 });
    await settle();

    expect(paths()).toContain('M52,20h96');
  });

  it('redraws a node that is resized and moved out of the viewport', async () => {
    host.nodes[1].point.set({ x: 2000, y: 100 });
    host.nodes[1].width!.set(300);
    await settle();

    expect(paths()).toContain('M2002,100h296');
  });

  it('draws nothing new on a selection change', async () => {
    const drawn = paths();

    host.nodes[0].selected.set(true);
    host.nodes[1].selected.set(true);
    await settle();

    expect(paths()).toBe(drawn);
  });
});
