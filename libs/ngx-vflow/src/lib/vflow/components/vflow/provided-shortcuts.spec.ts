import { ChangeDetectionStrategy, Component, Injectable, Provider, inject, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Vflow } from '../../vflow';
import { VflowComponent } from './vflow.component';
import { createNodes } from '../../interfaces/node.interface';
import { DeleteRequest } from '../../interfaces/delete-request.interface';
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
  template: `<vflow style="width: 400px; height: 300px" [nodes]="nodes" (deleteRequest)="deleteRequests.push($event)"
    ><div *vNode style="width: 100px; height: 50px"></div
  ></vflow>`,
})
class HostComponent {
  public readonly nodes = createNodes([{ id: 'a', point: { x: 0, y: 0 }, ariaLabel: 'Alpha' }]);
  public readonly deleteRequests: DeleteRequest[] = [];
}

describe('keys of vflow through withShortcuts', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  async function render(rootProviders: Provider[] = [], hostProviders: Provider[] = []) {
    TestBed.configureTestingModule({ providers: rootProviders });
    TestBed.overrideComponent(HostComponent, { set: { providers: hostProviders } });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    const flow = fixture.debugElement.query(By.directive(VflowComponent)).componentInstance as VflowComponent;
    await new Promise<void>((resolve) => flow.initialized.subscribe(() => resolve()));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  /** Presses and releases a key on the focused node; returns the press. */
  function press(code: string, key: string): KeyboardEvent {
    const node = fixture.nativeElement.querySelector('[aria-label="Alpha"]') as HTMLElement;
    node.focus();
    const event = new KeyboardEvent('keydown', { code, key, bubbles: true, cancelable: true });
    node.dispatchEvent(event);
    node.dispatchEvent(new KeyboardEvent('keyup', { code, key, bubbles: true }));
    fixture.detectChanges();
    return event;
  }

  const deletes = (code: string, key: string) => {
    host.deleteRequests.length = 0;
    press(code, key);
    return host.deleteRequests.length > 0;
  };

  const selects = (code: string, key: string) => {
    host.nodes[0].selected!.set(false);
    press(code, key);
    return host.nodes[0].selected!();
  };

  afterEach(() => fixture.destroy());

  it('requests deletion with the default keys without withShortcuts', async () => {
    await render();

    expect([deletes('Delete', 'Delete'), deletes('KeyX', 'x')]).toEqual([true, false]);
  });

  it('replaces the keys of a command provided at the root', async () => {
    await render(provideVflow(withShortcuts({ commands: { delete: ['x'] } })));

    expect([deletes('KeyX', 'x'), deletes('Delete', 'Delete')]).toEqual([true, false]);
  });

  it('keeps a command the root omits at its default keys', async () => {
    await render(provideVflow(withShortcuts({ commands: { delete: ['x'] } })));

    expect(selects('Enter', 'Enter')).toBe(true);
  });

  describe('a host-level withShortcuts over one at the root', () => {
    beforeEach(() =>
      render(
        provideVflow(withShortcuts({ modifiers: { panActivation: ['Space'] }, commands: { delete: ['x'] } })),
        provideVflow(withShortcuts({ commands: { select: ['s'] } })),
      ),
    );

    it('keeps the modifiers of the root, section by section', () => {
      // Space held for panning is taken from the page.
      expect(press('Space', ' ').defaultPrevented).toBe(true);
    });

    it('keeps the commands of the root that the host level does not give', () => {
      expect(deletes('KeyX', 'x')).toBe(true);
    });

    it('replaces the commands the host level gives', () => {
      expect([selects('KeyS', 's'), selects('Enter', 'Enter')]).toEqual([true, false]);
    });
  });

  it('runs a factory in the injector', async () => {
    await render(provideVflow(withShortcuts(() => inject(Preferences).shortcuts)));

    expect(deletes('KeyX', 'x')).toBe(true);
  });

  it('follows the signal a factory returns', async () => {
    await render(provideVflow(withShortcuts(() => inject(Preferences).shortcuts)));

    TestBed.inject(Preferences).shortcuts.set({ commands: { delete: [] } });

    expect([deletes('KeyX', 'x'), deletes('Delete', 'Delete')]).toEqual([false, false]);
  });
});
