import { ChangeDetectionStrategy, Component, Injectable, Provider, inject, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Vflow } from '../../vflow';
import { VflowComponent } from './vflow.component';
import { KeyboardService } from '../../services/keyboard.service';
import { KeyboardShortcuts } from '../../types/keyboard-shortcuts.type';
import { provideVflow } from '../../features/feature';
import { withShortcuts } from '../../features/with-shortcuts';

@Injectable({ providedIn: 'root' })
class Preferences {
  public readonly shortcuts = signal<KeyboardShortcuts>({ commands: { delete: ['x'] } });
}

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vflow [nodes]="[]"><div *vNode></div></vflow>`,
})
class HostComponent {}

describe('keys of vflow through withShortcuts', () => {
  let fixture: ComponentFixture<HostComponent>;
  let keyboard: KeyboardService;

  function render(rootProviders: Provider[] = [], hostProviders: Provider[] = []) {
    TestBed.configureTestingModule({ providers: rootProviders });
    TestBed.overrideComponent(HostComponent, { set: { providers: hostProviders } });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    keyboard = fixture.debugElement.query(By.directive(VflowComponent)).injector.get(KeyboardService);
  }

  const command = (name: 'delete' | 'select', code: string, key: string) =>
    keyboard.isCommand(name, new KeyboardEvent('keydown', { code, key }));

  function holding(code: string, key: string, read: () => boolean): boolean {
    document.dispatchEvent(new KeyboardEvent('keydown', { code, key }));
    try {
      return read();
    } finally {
      document.dispatchEvent(new KeyboardEvent('keyup', { code, key }));
    }
  }

  afterEach(() => fixture.destroy());

  it('reads the default keys without withShortcuts', () => {
    render();

    expect(command('delete', 'Delete', 'Delete')).toBe(true);
    expect(command('delete', 'KeyX', 'x')).toBe(false);
  });

  it('reads the keys provided at the root, with omitted entries at their defaults', () => {
    render(provideVflow(withShortcuts({ commands: { delete: ['x'] } })));

    expect(command('delete', 'KeyX', 'x')).toBe(true);
    expect(command('delete', 'Delete', 'Delete')).toBe(false);
    expect(command('select', 'Enter', 'Enter')).toBe(true);
  });

  it('lays the entries of a host-level withShortcuts over those of the root, section by section', () => {
    render(
      provideVflow(withShortcuts({ modifiers: { panActivation: ['Space'] }, commands: { delete: ['x'] } })),
      provideVflow(withShortcuts({ commands: { select: ['s'] } })),
    );

    expect(holding('Space', ' ', () => keyboard.isActiveModifier('panActivation'))).toBe(true);
    expect(command('delete', 'KeyX', 'x')).toBe(true);
    expect(command('select', 'KeyS', 's')).toBe(true);
    expect(command('select', 'Enter', 'Enter')).toBe(false);
  });

  it('runs a factory in the injector and follows the signal it returns', () => {
    render(provideVflow(withShortcuts(() => inject(Preferences).shortcuts)));
    expect(command('delete', 'KeyX', 'x')).toBe(true);

    TestBed.inject(Preferences).shortcuts.set({ commands: { delete: [] } });
    expect(command('delete', 'KeyX', 'x')).toBe(false);
    expect(command('delete', 'Delete', 'Delete')).toBe(false);
  });
});
