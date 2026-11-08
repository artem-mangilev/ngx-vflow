import { ChangeDetectionStrategy, Component, Injectable, Provider, inject, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Vflow } from '../../vflow';
import { VflowComponent } from './vflow.component';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { createNodes } from '../../interfaces/node.interface';
import { AriaLabelConfig } from '../../interfaces/aria-label-config.interface';
import { provideVflow } from '../../features/feature';
import { withAccessibility } from '../../features/with-accessibility';

@Injectable({ providedIn: 'root' })
class Translations {
  public readonly labels = signal<Partial<AriaLabelConfig>>({ flowLabel: 'Схема', nodeRole: 'шаг' });
}

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vflow [nodes]="nodes" style="width: 400px; height: 300px"
    ><div *vNode style="width: 100px; height: 50px"></div
  ></vflow>`,
})
class HostComponent {
  public readonly nodes = createNodes([{ id: 'a', point: { x: 0, y: 0 }, ariaLabel: 'Alpha' }]);
}

describe('labels of vflow through withAccessibility', () => {
  let fixture: ComponentFixture<HostComponent>;
  let root: HTMLElement;
  let settings: FlowSettingsService;

  async function render(rootProviders: Provider[] = [], hostProviders: Provider[] = []) {
    TestBed.configureTestingModule({ providers: rootProviders });
    TestBed.overrideComponent(HostComponent, { set: { providers: hostProviders } });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    root = fixture.nativeElement;
    settings = fixture.debugElement.query(By.directive(VflowComponent)).injector.get(FlowSettingsService);
  }

  const flowLabel = () => root.querySelector('[role="region"]')?.getAttribute('aria-label');
  const node = () => root.querySelector('[aria-label="Alpha"]')!;
  const description = (element: Element) =>
    (element.getAttribute('aria-describedby') ?? '')
      .split(' ')
      .map((id) => document.getElementById(id)?.textContent ?? '')
      .join(' ')
      .trim();

  afterEach(() => fixture.destroy());

  it('reads the English defaults without withAccessibility', async () => {
    await render();

    expect(flowLabel()).toBe('Graph');
    expect(node().getAttribute('aria-roledescription')).toBe('node');
  });

  it('reads the labels provided at the root as the defaults plus the supplied keys', async () => {
    await render(provideVflow(withAccessibility({ flowLabel: 'Граф', parentRole: 'frame' })));

    expect(flowLabel()).toBe('Граф');
    expect(settings.ariaLabels().parentRole).toBe('frame');
    expect(settings.ariaLabels().nodeRole).toBe('node');
  });

  it('lays the keys of a host-level withAccessibility over those of the root', async () => {
    await render(
      provideVflow(withAccessibility({ flowLabel: 'Граф', nodeRole: 'узел' })),
      provideVflow(withAccessibility({ nodeRole: 'шаг' })),
    );

    expect(flowLabel()).toBe('Граф');
    expect(node().getAttribute('aria-roledescription')).toBe('шаг');
  });

  it('runs a factory in the injector and follows the signal it returns, instructions included', async () => {
    await render(provideVflow(withAccessibility(() => inject(Translations).labels)));
    expect(flowLabel()).toBe('Схема');
    expect(node().getAttribute('aria-roledescription')).toBe('шаг');

    TestBed.inject(Translations).labels.set({ flowLabel: 'Диаграмма', nodeInstructions: 'Нажмите клавишу.' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(flowLabel()).toBe('Диаграмма');
    expect(node().getAttribute('aria-roledescription')).toBe('node');
    expect(description(node())).toContain('Нажмите клавишу.');
  });
});
