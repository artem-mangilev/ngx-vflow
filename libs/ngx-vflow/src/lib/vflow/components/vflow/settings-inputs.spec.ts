import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Vflow } from '../../vflow';
import { VflowComponent } from './vflow.component';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { KeyboardService } from '../../services/keyboard.service';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { createNodes, Node } from '../../interfaces/node.interface';
import { DEFAULT_OPTIMIZATION, Optimization } from '../../interfaces/optimization.interface';
import { SelectionBoxSettings } from '../../interfaces/selection-box-settings.interface';
import { KeyboardShortcuts } from '../../types/keyboard-shortcuts.type';
import { AriaLabelConfig } from '../../interfaces/aria-label-config.interface';

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vflow
    [nodes]="nodes"
    [optimization]="optimization"
    [selectionBox]="selectionBox"
    [keyboardShortcuts]="keyboardShortcuts"
    [ariaLabelConfig]="ariaLabelConfig"
    [parentsBelowEdges]="parentsBelowEdges">
    <ng-template vNode><div style="width: 100px; height: 50px"></div></ng-template>
  </vflow>`,
})
class SettingsHostComponent {
  @Input() nodes: Node[] = [];
  @Input() optimization: Optimization = {};
  @Input() selectionBox: SelectionBoxSettings = {};
  @Input() keyboardShortcuts: KeyboardShortcuts = {};
  @Input() ariaLabelConfig: Partial<AriaLabelConfig> = {};
  @Input() parentsBelowEdges = false;
}

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vflow [nodes]="[]"
    ><ng-template vNode><div></div></ng-template
  ></vflow>`,
})
class BareHostComponent {}

describe('object settings of vflow', () => {
  let fixture: ComponentFixture<SettingsHostComponent>;
  let settings: FlowSettingsService;
  let keyboard: KeyboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SettingsHostComponent, BareHostComponent] });
    fixture = TestBed.createComponent(SettingsHostComponent);
    fixture.detectChanges();
    const injector = fixture.debugElement.query(By.directive(VflowComponent)).injector;
    settings = injector.get(FlowSettingsService);
    keyboard = injector.get(KeyboardService);
  });

  afterEach(() => {
    document.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', key: ' ' }));
    fixture.destroy();
  });

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

  it('reads ariaLabelConfig as the defaults plus the supplied keys', () => {
    bind('ariaLabelConfig', { flowLabel: 'Approval graph' });
    expect(settings.ariaLabels().flowLabel).toBe('Approval graph');
    bind('ariaLabelConfig', { parentRole: 'frame' });
    expect(settings.ariaLabels().flowLabel).toBe('Graph');
    expect(settings.ariaLabels().parentRole).toBe('frame');
  });

  it('returns an omitted keyboard shortcut entry to its default', () => {
    bind('keyboardShortcuts', { modifiers: { panActivation: ['Space'] } });
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ' }));
    expect(keyboard.isActiveModifier('panActivation')).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', key: ' ' }));

    bind('keyboardShortcuts', { commands: { delete: ['x'] } });
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ' }));
    expect(keyboard.isActiveModifier('panActivation')).toBe(false);
    expect(keyboard.isCommand('delete', new KeyboardEvent('keydown', { code: 'KeyX', key: 'x' }))).toBe(true);
    expect(keyboard.isCommand('delete', new KeyboardEvent('keydown', { code: 'Delete', key: 'Delete' }))).toBe(false);
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
    const injector = bare.debugElement.query(By.directive(VflowComponent)).injector;
    expect(injector.get(FlowSettingsService).view()).toBe('auto');
    const root = bare.nativeElement.querySelector('.v-root') as HTMLElement;
    expect(root.style.width).toBe('100%');
    expect(root.style.height).toBe('100%');
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

  it('normalizes values on the way in and reads them back from the flow', () => {
    const { fixture, flow, settings, entities } = setup();
    fixture.componentRef.setInput('minZoom', 0.2);
    fixture.componentRef.setInput('paneClickDistance', -5);
    fixture.componentRef.setInput('optimization', { virtualization: true });
    fixture.componentRef.setInput('connection', { allowSelfConnections: true });

    expect(flow.minZoom()).toBe(0.2);
    expect(settings.minZoom()).toBe(0.2);
    expect(settings.paneClickDistance()).toBe(0);
    expect(flow.optimization()).toEqual({ ...DEFAULT_OPTIMIZATION, virtualization: true });
    expect(entities.connection().allowSelfConnections).toBe(true);
  });
});
