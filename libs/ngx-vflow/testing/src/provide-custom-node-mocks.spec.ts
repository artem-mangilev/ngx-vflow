import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Vflow, VflowHandleDirective, injectNode } from 'ngx-vflow';
import { provideCustomNodeMocks } from './provide-custom-node-mocks';

const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));

async function render<T>(component: new () => T) {
  TestBed.configureTestingModule({ imports: [component], providers: [provideCustomNodeMocks()] });
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  await fixture.whenStable();
  // The resizer reads the node on the next animation frame.
  await frame();
  fixture.detectChanges();

  return fixture;
}

describe('provideCustomNodeMocks', () => {
  // The example of the "Unit testing component nodes" docs page, with the real `Vflow` directives.
  @Component({
    template: `<div vResizable>{{ ctx.node.id }}<span vHandle handleType="source" position="right"></span></div>`,
    imports: [Vflow],
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  class DocsExampleNodeComponent {
    protected readonly ctx = injectNode();
  }

  it('renders the documented node with a real resizer and handle', async () => {
    const fixture = await render(DocsExampleNodeComponent);
    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent).toContain('mock');
    expect(host.querySelector('[vHandle]')!.getAttribute('data-v-handle-state')).toBe('idle');
  });

  @Component({
    template: `
      <div vResizable vSelectable>
        <span vDragHandle>{{ ctx.node.id }}</span>
        <span vHandle handleType="target" position="left"></span>
        <span vHandle handleType="source" position="right" handleId="out"></span>
        <v-node-toolbar position="top"><button vNoDrag>Delete</button></v-node-toolbar>
      </div>
    `,
    imports: [Vflow],
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  class EveryNodeDirectiveComponent {
    protected readonly ctx = injectNode();
  }

  it('renders every node-level directive of Vflow and ignores pointer input on its handles', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fixture = await render(EveryNodeDirectiveComponent);
    const host = fixture.nativeElement as HTMLElement;
    const handles = host.querySelectorAll('[vHandle]');

    expect(handles.length).toBe(2);
    expect(host.querySelector('v-node-toolbar')!.getAttribute('data-position')).toBe('top');

    handles[1].dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    handles[0].dispatchEvent(new PointerEvent('pointerenter'));
    handles[0].dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    (host.querySelector('[vSelectable]') as HTMLElement).click();
    fixture.detectChanges();

    expect(handles[1].getAttribute('data-v-handle-state')).toBe('idle');
  });

  @Component({
    selector: 'test-port',
    hostDirectives: [{ directive: VflowHandleDirective, inputs: ['handleType', 'position', 'handleId'] }],
    template: `{{ handle.handleType() }} {{ handle.state() }}`,
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  class PortComponent {
    protected readonly handle = inject(VflowHandleDirective);
  }

  @Component({
    template: `<test-port handleType="target" position="left" handleId="in" />`,
    imports: [PortComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  class PortNodeComponent {}

  it('runs a component that becomes a handle through hostDirectives', async () => {
    const fixture = await render(PortNodeComponent);
    const port = fixture.nativeElement.querySelector('test-port') as HTMLElement;

    expect(port.textContent!.trim()).toBe('target idle');
    expect(port.getAttribute('data-v-handle-position')).toBe('left');
  });
});
