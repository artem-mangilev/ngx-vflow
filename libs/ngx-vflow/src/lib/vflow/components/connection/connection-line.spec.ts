import { ChangeDetectionStrategy, Component, Directive, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Vflow } from '../../vflow';
import { VflowComponent } from '../vflow/vflow.component';
import { createNodes } from '../../interfaces/node.interface';
import { ConnectionSettings } from '../../interfaces/connection-settings.interface';
import { dispatchMouse, dispatchPointer } from '../../gestures/pointer-events.testing';
import { injectConnection } from '../../utils/inject-connection';

/** Draws the connection it injects: the template binds nothing. */
@Directive({
  selector: 'path[injectedLine]',
  host: { '[attr.d]': 'connection.path()', '[attr.marker-end]': 'connection.markerEnd()' },
})
class InjectedLineDirective {
  readonly connection = injectConnection();
}

@Component({
  imports: [Vflow, InjectedLineDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vflow style="width: 600px; height: 300px" [nodes]="nodes" [connection]="connection()">
    <div *vNode style="width: 100px; height: 40px">
      <span vHandle handleType="target" position="left"></span>
      <span vHandle handleType="source" position="right"></span>
    </div>
    @if (customLine()) {
      <ng-template vConnection let-ctx>
        <svg:path class="custom-line" [attr.d]="ctx.path()" [attr.marker-end]="ctx.markerEnd()" />
      </ng-template>
    }
    @if (injectedLine()) {
      <ng-template vConnection>
        <svg:path injectedLine class="injected-line" />
      </ng-template>
    }
  </vflow>`,
})
class ConnectionLineHostComponent {
  readonly flow = viewChild.required(VflowComponent);
  readonly connection = signal<ConnectionSettings>({});
  readonly customLine = signal(false);
  readonly injectedLine = signal(false);
  readonly nodes = createNodes([
    { id: 'a', point: { x: 0, y: 0 } },
    { id: 'b', point: { x: 300, y: 0 } },
  ]);
}

describe('connection line', () => {
  let fixture: ComponentFixture<ConnectionLineHostComponent>;
  let root: HTMLElement;
  let pane: DOMRect;

  async function stable() {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function setup(configure: (host: ConnectionLineHostComponent) => void = () => undefined) {
    fixture = TestBed.createComponent(ConnectionLineHostComponent);
    configure(fixture.componentInstance);
    root = fixture.nativeElement;
    fixture.detectChanges();
    await new Promise<void>((resolve) => fixture.componentInstance.flow().initialized.subscribe(() => resolve()));
    await stable();
    pane = root.querySelector('.v-pane')!.getBoundingClientRect();
  }

  afterEach(() => {
    // Ends a gesture a test left open.
    dispatchPointer(window, 'pointerup', { x: 0 });
  });

  const sourceHandle = () => root.querySelector('[data-v-node="a"] [data-v-handle-type="source"]')!;
  const defaultLine = () => root.querySelector('.v-connection-svg path');

  /** Presses the source handle of node `a` and moves the pointer to flow point (`x`, `y`) of the unmoved viewport. */
  async function dragFromSourceTo(x: number, y: number) {
    dispatchMouse(sourceHandle(), 'mousedown', { x: pane.left + 100, y: pane.top + 20 });
    dispatchPointer(window, 'pointermove', { x: pane.left + x, y: pane.top + y });
    await stable();
  }

  it('draws no line before a connection starts', async () => {
    await setup();

    expect(defaultLine()).toBeNull();
  });

  it('draws a line from the handle to the pointer while a connection is dragged', async () => {
    await setup((host) => host.connection.set({ curve: 'straight' }));

    await dragFromSourceTo(250, 150);

    expect(defaultLine()!.getAttribute('d')).toMatch(/^M [\d.]+,20L 250,150$/);
  });

  it('draws a bezier curve by default', async () => {
    await setup();

    await dragFromSourceTo(250, 150);

    expect(defaultLine()!.getAttribute('d')).toMatch(/^M[\d.]+,20 C.* 250,150$/);
  });

  it('removes the line when the pointer is released', async () => {
    await setup();
    await dragFromSourceTo(250, 150);

    dispatchPointer(window, 'pointerup', { x: pane.left + 250, y: pane.top + 150 });
    await stable();

    expect(defaultLine()).toBeNull();
  });

  it('ends the line on the target handle that would accept the connection', async () => {
    await setup((host) => host.connection.set({ curve: 'straight' }));
    await dragFromSourceTo(250, 150);

    root
      .querySelector('[data-v-node="b"] [data-v-handle-type="target"]')!
      .dispatchEvent(new PointerEvent('pointerenter'));
    await stable();

    expect(defaultLine()!.getAttribute('d')).toMatch(/^M [\d.]+,20L [\d.]+,20$/);
  });

  it('references the end marker of the connection settings, which the flow renders', async () => {
    await setup((host) => host.connection.set({ markerEnd: 'arrow' }));

    await dragFromSourceTo(250, 150);

    const [, id] = /^url\(#(-?\d+)\)$/.exec(defaultLine()!.getAttribute('marker-end')!)!;
    expect(root.querySelector(`marker[id="${id}"]`)).not.toBeNull();
  });

  it('draws the line without an end marker by default', async () => {
    await setup();

    await dragFromSourceTo(250, 150);

    expect(defaultLine()!.getAttribute('marker-end')).toBe('');
  });

  describe('with a vConnection template', () => {
    beforeEach(async () => {
      await setup((host) => {
        host.customLine.set(true);
        host.connection.set({ curve: 'straight', markerEnd: 'arrow' });
      });
    });

    it('renders the template in place of the default line', async () => {
      await dragFromSourceTo(250, 150);

      expect(root.querySelectorAll('.v-connection-svg path')).toHaveLength(1);
      expect(root.querySelector('.v-connection-svg .custom-line')).not.toBeNull();
    });

    it('gives the template the path of the line, which follows the pointer', async () => {
      await dragFromSourceTo(250, 150);
      dispatchPointer(window, 'pointermove', { x: pane.left + 200, y: pane.top + 100 });
      await stable();

      // The arrowhead insets the end along x, toward the source; y is the pointer's.
      expect(root.querySelector('.custom-line')!.getAttribute('d')).toMatch(/^M [\d.]+,20L 1\d\d(\.\d+)?,100$/);
    });

    it('gives the template the end marker reference', async () => {
      await dragFromSourceTo(250, 150);

      expect(root.querySelector('.custom-line')!.getAttribute('marker-end')).toMatch(/^url\(#-?\d+\)$/);
    });
  });

  it('gives a directive inside the template the connection through injectConnection()', async () => {
    await setup((host) => {
      host.injectedLine.set(true);
      host.connection.set({ curve: 'straight', markerEnd: 'arrow' });
    });

    await dragFromSourceTo(250, 150);
    dispatchPointer(window, 'pointermove', { x: pane.left + 200, y: pane.top + 100 });
    await stable();

    const line = root.querySelector('.injected-line')!;
    expect(line.getAttribute('d')).toMatch(/^M [\d.]+,20L 1\d\d(\.\d+)?,100$/);
    expect(line.getAttribute('marker-end')).toMatch(/^url\(#-?\d+\)$/);
  });
});
