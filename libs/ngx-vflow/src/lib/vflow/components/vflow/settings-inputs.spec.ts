import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Vflow } from '../../vflow';
import { VflowComponent } from './vflow.component';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { createNodes, Node } from '../../interfaces/node.interface';
import { DEFAULT_OPTIMIZATION, Optimization } from '../../interfaces/optimization.interface';
import { SelectionBoxSettings } from '../../interfaces/selection-box-settings.interface';

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vflow
    [nodes]="nodes"
    [optimization]="optimization"
    [selectionBox]="selectionBox"
    [parentsBelowEdges]="parentsBelowEdges">
    <div *vNode style="width: 100px; height: 50px"></div>
  </vflow>`,
})
class SettingsHostComponent {
  @Input() nodes: Node[] = [];
  @Input() optimization: Optimization = {};
  @Input() selectionBox: SelectionBoxSettings = {};
  @Input() parentsBelowEdges = false;
}

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vflow [nodes]="[]"><div *vNode></div></vflow>`,
})
class BareHostComponent {}

describe('object settings of vflow', () => {
  let fixture: ComponentFixture<SettingsHostComponent>;
  let settings: FlowSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SettingsHostComponent, BareHostComponent] });
    fixture = TestBed.createComponent(SettingsHostComponent);
    fixture.detectChanges();
    const injector = fixture.debugElement.query(By.directive(VflowComponent)).injector;
    settings = injector.get(FlowSettingsService);
  });

  afterEach(() => fixture.destroy());

  function bind(name: string, value: unknown) {
    fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
    TestBed.flushEffects();
  }

  it('reads optimization as the defaults plus the supplied keys', () => {
    bind('optimization', { virtualization: true });
    expect(settings.optimization()).toEqual({ virtualization: true, lazyLoadTrigger: 'immediate' });
    bind('optimization', { lazyLoadTrigger: 'viewport' });
    expect(settings.optimization()).toEqual({ virtualization: false, lazyLoadTrigger: 'viewport' });
    bind('optimization', { virtualization: undefined, lazyLoadTrigger: undefined });
    expect(settings.optimization()).toEqual({ virtualization: false, lazyLoadTrigger: 'immediate' });
  });

  it('reads selectionBox as the defaults plus the supplied keys', () => {
    bind('selectionBox', { mode: 'partial' });
    expect(settings.selectionBox()).toEqual({ mode: 'partial' });
    bind('selectionBox', {});
    expect(settings.selectionBox()).toEqual({ mode: 'full' });
  });

  it('puts parents below the edges only while parentsBelowEdges is set', async () => {
    bind(
      'nodes',
      createNodes([
        { id: 'parent', point: { x: 0, y: 0 }, width: 200, height: 200, ariaLabel: 'Parent' },
        { id: 'child', parentId: 'parent', point: { x: 10, y: 10 }, ariaLabel: 'Child' },
      ]),
    );
    await fixture.whenStable();
    const parent = fixture.nativeElement.querySelector('[aria-label="Parent"]') as HTMLElement;
    expect(Number(parent.style.zIndex)).toBeGreaterThanOrEqual(0);
    bind('parentsBelowEdges', true);
    expect(Number(parent.style.zIndex)).toBeLessThan(0);
    bind('parentsBelowEdges', false);
    expect(Number(parent.style.zIndex)).toBeGreaterThanOrEqual(0);
  });

  it('fills the parent element by default', () => {
    const bare = TestBed.createComponent(BareHostComponent);
    bare.detectChanges();
    const flow = bare.nativeElement.querySelector('vflow') as HTMLElement;
    const root = flow.querySelector('[data-v-root]') as HTMLElement;
    expect(root.getBoundingClientRect().width).toBeGreaterThan(0);
    expect(root.getBoundingClientRect().width).toBe(flow.getBoundingClientRect().width);
    expect(getComputedStyle(root).height).toBe(getComputedStyle(flow).height);
    bare.destroy();
  });
});

describe('settings inputs of vflow', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [VflowComponent] });
    const fixture = TestBed.createComponent(VflowComponent);
    fixture.componentRef.setInput('nodes', []);
    fixture.detectChanges();
    const injector = fixture.debugElement.injector;
    return {
      fixture,
      flow: fixture.componentInstance,
      settings: injector.get(FlowSettingsService),
      entities: injector.get(FlowEntitiesService),
    };
  }

  it('binds every setting, with the defaults of the service', () => {
    const { settings } = setup();
    const unbound = new FlowSettingsService();
    for (const key of Object.keys(unbound) as (keyof FlowSettingsService)[]) {
      const value: unknown = unbound[key];
      if (typeof value !== 'function' || !('bind' in value)) continue;
      expect([key, (settings[key] as () => unknown)()]).toEqual([key, (value as () => unknown)()]);
    }
  });

  it('normalizes values on the way in; the inputs keep what was bound', () => {
    const { fixture, flow, settings, entities } = setup();
    fixture.componentRef.setInput('minZoom', 0.2);
    fixture.componentRef.setInput('paneClickDistance', -5);
    fixture.componentRef.setInput('optimization', { virtualization: true });
    fixture.componentRef.setInput('connection', { allowSelfConnections: true });

    expect(flow.minZoom()).toBe(0.2);
    expect(settings.minZoom()).toBe(0.2);
    expect(settings.paneClickDistance()).toBe(0);
    expect(flow.optimization()).toEqual({ virtualization: true });
    expect(flow.settings.optimization()).toEqual({ ...DEFAULT_OPTIMIZATION, virtualization: true });
    expect(flow.settings.paneClickDistance()).toBe(0);
    expect(settings.optimization()).toEqual({ ...DEFAULT_OPTIMIZATION, virtualization: true });
    expect(entities.connection().allowSelfConnections).toBe(true);
  });
});
