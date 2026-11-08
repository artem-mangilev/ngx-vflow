import { ChangeDetectionStrategy, Component, Injectable, Provider, inject, input, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Vflow } from '../../vflow';
import { VflowComponent } from './vflow.component';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { provideVflow } from '../../features/feature';
import { withSettings } from '../../features/with-settings';
import { VFLOW_SETTINGS_DEFAULTS, VflowSettings } from '../../interfaces/vflow-settings.interface';
import { Optimization } from '../../interfaces/optimization.interface';
import { AutoPanSettings } from '../../interfaces/auto-pan-settings.interface';

@Injectable({ providedIn: 'root' })
class Preferences {
  public readonly flow = signal<Partial<VflowSettings>>({ minZoom: 0.1 });
}

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vflow [nodes]="[]" [minZoom]="minZoom()" [optimization]="optimization()" [autoPan]="autoPan()">
    <div *vNode></div>
  </vflow>`,
})
class HostComponent {
  public readonly minZoom = input<number>();
  public readonly optimization = input<Optimization>();
  public readonly autoPan = input<boolean | AutoPanSettings>();
}

describe('settings of vflow through withSettings', () => {
  let fixture: ComponentFixture<HostComponent>;
  let settings: FlowSettingsService;
  let entities: FlowEntitiesService;

  function render(root: Provider[] = [], host: Provider[] = []) {
    TestBed.configureTestingModule({ providers: root });
    TestBed.overrideComponent(HostComponent, { set: { providers: host } });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const injector = fixture.debugElement.query(By.directive(VflowComponent)).injector;
    settings = injector.get(FlowSettingsService);
    entities = injector.get(FlowEntitiesService);
  }

  function bind(name: string, value: unknown) {
    fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  afterEach(() => fixture.destroy());

  it('reads the defaults without inputs and without withSettings', () => {
    render();

    expect(settings.minZoom()).toBe(VFLOW_SETTINGS_DEFAULTS.minZoom);
    expect(settings.optimization()).toEqual({ virtualization: false, lazyLoadTrigger: 'immediate' });
    expect(settings.autoPan()).toBe(true);
    expect(settings.paneClickDistance()).toBe(6);
  });

  it('reads settings provided at the root', () => {
    render(provideVflow(withSettings({ minZoom: 0.2, selectionMode: 'manual' })));

    expect(settings.minZoom()).toBe(0.2);
    expect(settings.selectionMode()).toBe('manual');
  });

  it('lays the keys of a host-level withSettings over those of the root', () => {
    render(
      provideVflow(withSettings({ minZoom: 0.2, maxZoom: 4 })),
      provideVflow(withSettings({ maxZoom: 5, connection: { allowSelfConnections: true } })),
    );

    expect(settings.minZoom()).toBe(0.2);
    expect(settings.maxZoom()).toBe(5);
    expect(entities.connectionSettings()).toEqual({ allowSelfConnections: true });
  });

  it('lets a bound input win and an unbound input fall through', () => {
    render(provideVflow(withSettings({ minZoom: 0.2 })));
    expect(settings.minZoom()).toBe(0.2);

    bind('minZoom', 1);
    expect(settings.minZoom()).toBe(1);
    bind('minZoom', undefined);
    expect(settings.minZoom()).toBe(0.2);
  });

  it('merges an object setting through the defaults, the provider and the input', () => {
    render(provideVflow(withSettings({ optimization: { virtualization: true } })));
    expect(settings.optimization()).toEqual({ virtualization: true, lazyLoadTrigger: 'immediate' });

    bind('optimization', { lazyLoadTrigger: 'viewport' });
    expect(settings.optimization()).toEqual({ virtualization: true, lazyLoadTrigger: 'viewport' });
    bind('optimization', { virtualization: false });
    expect(settings.optimization()).toEqual({ virtualization: false, lazyLoadTrigger: 'immediate' });
  });

  it('merges objects of a boolean-or-object setting and lets a boolean replace them', () => {
    render(provideVflow(withSettings({ autoPan: { speed: 100 } })));
    expect(settings.autoPan()).toEqual({ speed: 100 });

    bind('autoPan', { margin: 10 });
    expect(settings.autoPan()).toEqual({ speed: 100, margin: 10 });
    bind('autoPan', false);
    expect(settings.autoPan()).toBe(false);
  });

  it('sanitizes a provided distance', () => {
    render(provideVflow(withSettings({ paneClickDistance: -5, nodeDragThreshold: Number.NaN })));

    expect(settings.paneClickDistance()).toBe(0);
    expect(settings.nodeDragThreshold()).toBe(0);
  });

  it('runs a factory in the injector and follows the signal it returns', () => {
    render(provideVflow(withSettings(() => inject(Preferences).flow)));
    expect(settings.minZoom()).toBe(0.1);

    TestBed.inject(Preferences).flow.set({ minZoom: 0.3, maxZoom: 8 });
    expect(settings.minZoom()).toBe(0.3);
    expect(settings.maxZoom()).toBe(8);
  });
});
