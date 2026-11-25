import { ChangeDetectionStrategy, Component, Injectable, Provider, inject, input, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Vflow } from '../../vflow';
import { VflowComponent } from './vflow.component';
import { provideVflow } from '../../features/feature';
import { withSettings } from '../../features/with-settings';
import { VFLOW_SETTINGS_DEFAULTS, VflowSettings } from '../../interfaces/vflow-settings.interface';
import { ConnectionSettings } from '../../interfaces/connection-settings.interface';
import { AutoPanSettings } from '../../interfaces/auto-pan-settings.interface';
import { Background } from '../../types/background.type';

@Injectable({ providedIn: 'root' })
class Preferences {
  public readonly flow = signal<Partial<VflowSettings>>({ minZoom: 0.1 });
}

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vflow
    [nodes]="[]"
    [minZoom]="minZoom()"
    [connection]="connection()"
    [autoPan]="autoPan()"
    [background]="background()">
    <div *vNode></div>
  </vflow>`,
})
class HostComponent {
  public readonly minZoom = input<number>();
  public readonly connection = input<ConnectionSettings>();
  public readonly autoPan = input<boolean | AutoPanSettings>();
  public readonly background = input<Background | null>();
}

describe('settings of vflow through withSettings', () => {
  let fixture: ComponentFixture<HostComponent>;
  let flow: VflowComponent;

  function render(root: Provider[] = [], host: Provider[] = []) {
    TestBed.configureTestingModule({ providers: root });
    TestBed.overrideComponent(HostComponent, { set: { providers: host } });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    flow = fixture.debugElement.query(By.directive(VflowComponent)).componentInstance;
  }

  function bind(name: string, value: unknown) {
    fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  afterEach(() => fixture.destroy());

  it('reads the defaults without inputs and without withSettings', () => {
    render();

    const settings = Object.fromEntries(Object.entries(flow.settings).map(([key, value]) => [key, value()]));
    expect(settings).toEqual(VFLOW_SETTINGS_DEFAULTS);
  });

  it('reads settings provided at the root', () => {
    render(provideVflow(withSettings({ minZoom: 0.2, selectionMode: 'manual' })));

    expect([flow.settings.minZoom(), flow.settings.selectionMode()]).toEqual([0.2, 'manual']);
  });

  it('lays the keys of a host-level withSettings over those of the root', () => {
    render(
      provideVflow(withSettings({ minZoom: 0.2, maxZoom: 4 })),
      provideVflow(withSettings({ maxZoom: 5, connection: { allowSelfConnections: true } })),
    );

    expect(flow.settings.minZoom()).toBe(0.2);
    expect(flow.settings.maxZoom()).toBe(5);
    expect(flow.settings.connection()).toEqual({ allowSelfConnections: true });
  });

  it('lets a bound input win over a provided setting', () => {
    render(provideVflow(withSettings({ minZoom: 0.2 })));

    bind('minZoom', 1);

    expect(flow.settings.minZoom()).toBe(1);
  });

  it('falls through to the provided setting when an input is unbound again', () => {
    render(provideVflow(withSettings({ minZoom: 0.2 })));
    bind('minZoom', 1);

    bind('minZoom', undefined);

    expect(flow.settings.minZoom()).toBe(0.2);
  });

  it('takes null from an input as a value, so it turns off a provided background', () => {
    render(provideVflow(withSettings({ background: { type: 'dots' } })));

    bind('background', null);

    expect(flow.settings.background()).toBeNull();
  });

  it('merges the keys of an object input into those of the provided object', () => {
    render(provideVflow(withSettings({ connection: { allowSelfConnections: true } })));

    bind('connection', { allowDuplicateConnections: true });

    expect(flow.settings.connection()).toEqual({ allowSelfConnections: true, allowDuplicateConnections: true });
  });

  it('lets a key of an object input win over the same key of the provided object', () => {
    render(provideVflow(withSettings({ connection: { allowSelfConnections: true } })));
    bind('connection', { allowDuplicateConnections: true });

    bind('connection', { allowSelfConnections: false });

    expect(flow.settings.connection()).toEqual({ allowSelfConnections: false });
  });

  it('merges the objects of a boolean-or-object setting', () => {
    render(provideVflow(withSettings({ autoPan: { speed: 100 } })));

    bind('autoPan', { margin: 10 });

    expect(flow.settings.autoPan()).toEqual({ speed: 100, margin: 10 });
  });

  it('lets a boolean replace the provided object of a boolean-or-object setting', () => {
    render(provideVflow(withSettings({ autoPan: { speed: 100 } })));

    bind('autoPan', false);

    expect(flow.settings.autoPan()).toBe(false);
  });

  it.each([
    ['a negative distance', 'paneClickDistance' as const, -5],
    ['a distance that is not a number', 'nodeDragThreshold' as const, Number.NaN],
  ])('reads %s as 0', (_, key, value) => {
    render(provideVflow(withSettings({ [key]: value })));

    expect(flow.settings[key]()).toBe(0);
  });

  it('runs a factory in the injector', () => {
    render(provideVflow(withSettings(() => inject(Preferences).flow)));

    expect(flow.settings.minZoom()).toBe(0.1);
  });

  it('follows the signal a factory returns', () => {
    render(provideVflow(withSettings(() => inject(Preferences).flow)));

    TestBed.inject(Preferences).flow.set({ minZoom: 0.3, maxZoom: 8 });

    expect([flow.settings.minZoom(), flow.settings.maxZoom()]).toEqual([0.3, 8]);
  });
});
