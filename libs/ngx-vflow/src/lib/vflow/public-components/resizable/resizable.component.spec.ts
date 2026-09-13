import {
  ChangeDetectionStrategy,
  Component,
  provideZonelessChangeDetection,
  reflectComponentType,
  signal,
  viewChild,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ResizableMockComponent } from 'ngx-vflow/testing';
import { firstValueFrom } from 'rxjs';
import { Node, createNodes } from '../../interfaces/node.interface';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { VflowComponent } from '../../components/vflow/vflow.component';
import { Vflow } from '../../vflow';
import { ResizableComponent } from './resizable.component';

@Component({
  template: `
    <vflow [view]="[400, 300]" [nodes]="nodes">
      <ng-template node>
        @if (useCustomGap()) {
          <div class="resizable-host" resizable [gap]="gap()"></div>
        } @else {
          <div class="resizable-host" resizable></div>
        }
      </ng-template>
    </vflow>
  `,
  styles: `
    :host {
      display: block;
      width: 400px;
      height: 300px;
    }

    .resizable-host {
      width: 100px;
      height: 80px;
    }
  `,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ResizableTestHostComponent {
  public readonly vflow = viewChild.required(VflowComponent);
  public readonly gap = signal(4);
  public readonly useCustomGap = signal(true);
  public readonly nodes = createNodes([{ id: 'node', point: { x: 50, y: 50 } }]);
}

@Component({
  template: `
    <vflow [view]="[400, 300]" [nodes]="nodes()">
      <ng-template node>
        @if (withResizable()) {
          <div class="card" resizable>
            <div class="content"></div>
            <handle type="source" position="right" />
          </div>
        } @else {
          <div class="card">
            <div class="content"></div>
            <handle type="source" position="right" />
          </div>
        }
      </ng-template>
    </vflow>
  `,
  styles: `
    :host {
      display: block;
      width: 400px;
      height: 300px;
    }

    .card {
      /* content-box proves the library adds border-box only for an explicit size */
      box-sizing: content-box;
      min-width: 240px;
      min-height: 120px;
      padding: 10px;
      border: 2px solid;
      border-radius: 8px;
      overflow: hidden;
    }

    .content {
      width: 20px;
      height: 20px;
    }
  `,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SizeTargetHostComponent {
  public readonly withResizable = signal(true);
  public readonly nodes = signal<Node[]>(createNodes([{ id: 'node', point: { x: 20, y: 20 } }]));
}

const SIZED_NODES = () => createNodes([{ id: 'node', point: { x: 20, y: 20 }, width: 300, height: 150 }]);

async function settle(fixture: ComponentFixture<unknown>) {
  fixture.detectChanges();
  for (let i = 0; i < 5; i++) await new Promise(requestAnimationFrame);
  await fixture.whenStable();
  fixture.detectChanges();
}

async function createSizeTargetFixture(options: { withResizable?: boolean; nodes?: Node[] } = {}) {
  TestBed.configureTestingModule({
    imports: [SizeTargetHostComponent],
    providers: [provideZonelessChangeDetection()],
  });

  const fixture = TestBed.createComponent(SizeTargetHostComponent);
  fixture.componentInstance.withResizable.set(options.withResizable ?? true);
  if (options.nodes) fixture.componentInstance.nodes.set(options.nodes);
  await settle(fixture);

  const root = fixture.nativeElement as HTMLElement;
  const entities = fixture.debugElement.query(By.directive(VflowComponent)).injector.get(FlowEntitiesService);

  return {
    fixture,
    model: () => entities.nodes()[0],
    card: () => root.querySelector<HTMLElement>('.card')!,
    wrapper: () => root.querySelector<HTMLElement>('.wrapper')!,
    node: () => root.querySelector<HTMLElement>('.vflow-node')!,
    controls: () => Array.from(root.querySelectorAll<HTMLElement>('.resize-control')),
    handle: () => root.querySelector<HTMLElement>('handle .handle')!,
  };
}

function drag(control: Element, dx: number, dy: number) {
  const { x, y } = center(control);
  const mouse = (type: string, clientX: number, clientY: number) =>
    new MouseEvent(type, { clientX, clientY, bubbles: true, view: window, buttons: type === 'mouseup' ? 0 : 1 });

  control.dispatchEvent(mouse('mousedown', x, y));
  window.dispatchEvent(mouse('mousemove', x + dx / 2, y + dy / 2));
  window.dispatchEvent(mouse('mousemove', x + dx, y + dy));
  window.dispatchEvent(mouse('mouseup', x + dx, y + dy));
}

function center(element: Element) {
  const rect = element.getBoundingClientRect();

  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function expectCloseTo(actual: number, expected: number) {
  expect(actual).toBeCloseTo(expected, 1);
}

async function createFixture(useCustomGap = true) {
  TestBed.configureTestingModule({
    imports: [ResizableTestHostComponent],
    providers: [provideZonelessChangeDetection()],
  });

  const fixture = TestBed.createComponent(ResizableTestHostComponent);
  fixture.componentInstance.useCustomGap.set(useCustomGap);
  fixture.detectChanges();
  await fixture.whenStable();

  return fixture;
}

describe('ResizableComponent', () => {
  it('exposes gap as an input in production and testing components', () => {
    const productionInputs = reflectComponentType(ResizableComponent)?.inputs;
    const testingInputs = reflectComponentType(ResizableMockComponent)?.inputs;

    expect(productionInputs).toContain(jasmine.objectContaining({ propName: 'gap', templateName: 'gap' }));
    expect(testingInputs).toContain(jasmine.objectContaining({ propName: 'gap', templateName: 'gap' }));
  });

  it('applies a custom gap to every resize line and corner handle', async () => {
    const fixture: ComponentFixture<ResizableTestHostComponent> = await createFixture();

    const host = fixture.nativeElement as HTMLElement;
    const controls = Array.from(host.querySelectorAll<HTMLElement>('.resize-control'));

    expect(controls.length).toBe(8);
    controls.forEach((control) => expect(control.style.getPropertyValue('--resizer-gap')).toBe('4px'));
  });

  it('renders controls at the default 1.5px gap', async () => {
    const fixture = await createFixture(false);

    const host = fixture.nativeElement as HTMLElement;
    const node = host.querySelector('.vflow-node')!;
    const topLeft = host.querySelector('.resize-control.handle.top.left')!;
    const nodeRect = node.getBoundingClientRect();
    const handleCenter = center(topLeft);

    expectCloseTo(nodeRect.left - handleCenter.x, 1.5);
    expectCloseTo(nodeRect.top - handleCenter.y, 1.5);
  });

  it('keeps every custom-gap control aligned at non-unit zoom with autoScale', async () => {
    const fixture = await createFixture();

    const viewportChanged = firstValueFrom(fixture.componentInstance.vflow().viewportChange$);
    fixture.componentInstance.vflow().viewportTo({ x: 0, y: 0, zoom: 0.5 });
    await viewportChanged;
    fixture.detectChanges();
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    const nodeRect = host.querySelector('.vflow-node')!.getBoundingClientRect();
    const expectedScreenGap = fixture.componentInstance.gap() * 0.5;

    const top = center(host.querySelector('.resize-control.line.top')!);
    const right = center(host.querySelector('.resize-control.line.right')!);
    const bottom = center(host.querySelector('.resize-control.line.bottom')!);
    const left = center(host.querySelector('.resize-control.line.left')!);
    const topLeft = center(host.querySelector('.resize-control.handle.top.left')!);
    const topRight = center(host.querySelector('.resize-control.handle.top.right')!);
    const bottomLeft = center(host.querySelector('.resize-control.handle.bottom.left')!);
    const bottomRight = center(host.querySelector('.resize-control.handle.bottom.right')!);

    expectCloseTo(nodeRect.top - top.y, expectedScreenGap);
    expectCloseTo(right.x - nodeRect.right, expectedScreenGap);
    expectCloseTo(bottom.y - nodeRect.bottom, expectedScreenGap);
    expectCloseTo(nodeRect.left - left.x, expectedScreenGap);

    expectCloseTo(nodeRect.left - topLeft.x, expectedScreenGap);
    expectCloseTo(nodeRect.top - topLeft.y, expectedScreenGap);
    expectCloseTo(topRight.x - nodeRect.right, expectedScreenGap);
    expectCloseTo(nodeRect.top - topRight.y, expectedScreenGap);
    expectCloseTo(nodeRect.left - bottomLeft.x, expectedScreenGap);
    expectCloseTo(bottomLeft.y - nodeRect.bottom, expectedScreenGap);
    expectCloseTo(bottomRight.x - nodeRect.right, expectedScreenGap);
    expectCloseTo(bottomRight.y - nodeRect.bottom, expectedScreenGap);

    expect(host.querySelector('.resize-control.handle')!.getBoundingClientRect().width).toBeCloseTo(6, 1);
  });

  describe('size target', () => {
    it('leaves a content-sized node without inline size so the node box follows the element', async () => {
      const { model, card, wrapper, node } = await createSizeTargetFixture();

      expect(model().sizeMode()).toBe('auto');
      expect(card().style.width).toBe('');
      expect(wrapper().style.width).toBe('');
      // content-box min-width 240 + padding 20 + border 4
      expect(card().offsetWidth).toBe(264);
      expect(node().offsetWidth).toBe(264);
      expect(model().width()).toBe(264);
    });

    it('writes an explicit size to the resizable element as a border box instead of the wrapper', async () => {
      const { card, wrapper, node } = await createSizeTargetFixture({ nodes: SIZED_NODES() });

      expect(card().style.width).toBe('300px');
      expect(card().style.height).toBe('150px');
      expect(card().style.boxSizing).toBe('border-box');
      expect(wrapper().style.width).toBe('');
      expect([card().offsetWidth, card().offsetHeight]).toEqual([300, 150]);
      expect([node().offsetWidth, node().offsetHeight]).toEqual([300, 150]);
    });

    it('moves the size onto the resizable element once the resizer commits', async () => {
      const { fixture, model, card, node } = await createSizeTargetFixture();

      model().resizedExplicitly.set(true);
      model().width.set(320);
      model().height.set(200);
      await settle(fixture);

      expect(card().style.width).toBe('320px');
      expect([card().offsetWidth, node().offsetWidth]).toEqual([320, 320]);
      expect(model().width()).toBe(320);
    });

    it('renders controls in the node layer so a clipping element cannot hide them', async () => {
      const { card, node, controls } = await createSizeTargetFixture();

      expect(controls().length).toBe(8);
      controls().forEach((control) => {
        expect(card().contains(control)).toBeFalse();
        expect(node().contains(control)).toBeTrue();
      });
    });

    it('sizes the wrapper when the application provides a size without a resizable element', async () => {
      const { card, wrapper, controls } = await createSizeTargetFixture({ withResizable: false, nodes: SIZED_NODES() });

      expect(wrapper().style.width).toBe('300px');
      expect(wrapper().style.height).toBe('150px');
      expect(card().style.width).toBe('');
      expect(controls().length).toBe(0);
    });

    it('hands the size back to the wrapper and removes controls when the resizable element is destroyed', async () => {
      const { fixture, model, wrapper, controls } = await createSizeTargetFixture({ nodes: SIZED_NODES() });

      fixture.componentInstance.withResizable.set(false);
      await settle(fixture);

      expect(model().resizerTemplate()).toBeNull();
      expect(controls().length).toBe(0);
      expect(wrapper().style.width).toBe('300px');
    });

    it('switches a content-sized node to explicit before the resizer writes its first size', async () => {
      const { fixture, model, card, controls } = await createSizeTargetFixture();
      const modesAtWrite: string[] = [];
      const setWidth = model().width.set;
      spyOn(model().width, 'set').and.callFake((value: number) => {
        modesAtWrite.push(model().sizeMode());
        setWidth.call(model().width, value);
      });

      drag(
        controls().find((control) => control.matches('.handle.bottom.right'))!,
        40,
        30,
      );
      await settle(fixture);

      expect(modesAtWrite.length).toBeGreaterThan(0);
      expect(modesAtWrite.every((mode) => mode === 'explicit')).toBeTrue();
      expect(model().width()).toBe(304);
      expect(card().style.width).toBe('304px');
      expect(card().offsetWidth).toBe(304);
    });

    it('ignores measurements during a gesture, then reconciles the size and moves the handles', async () => {
      const { fixture, model, card, handle } = await createSizeTargetFixture({ nodes: SIZED_NODES() });

      model().resizing.set(true);
      model().width.set(100);
      await settle(fixture);

      // CSS min-width wins in the DOM, but the gesture still owns the model size.
      expect(card().offsetWidth).toBe(240);
      expect(model().width()).toBe(100);

      model().resizing.set(false);
      await settle(fixture);

      expect(model().width()).toBe(240);
      const handleModel = model().handles()[0];
      expect(handleModel.pointAbsolute().x - model().globalPoint().x).toBeCloseTo(240 + handle().offsetWidth / 2, 1);
    });
  });
});
