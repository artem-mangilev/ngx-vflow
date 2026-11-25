import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KeyboardService } from './keyboard.service';
import { KeyboardShortcuts } from '../types/keyboard-shortcuts.type';

describe('KeyboardService modifiers', () => {
  let service: KeyboardService;
  let shortcuts: ReturnType<typeof signal<KeyboardShortcuts>>;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [KeyboardService] });
    service = TestBed.inject(KeyboardService);
    shortcuts = signal<KeyboardShortcuts>({ modifiers: { panActivation: ['Shift'] } });
    service.bindShortcuts(shortcuts);
  });

  const key = (type: 'keydown' | 'keyup', code: string) =>
    document.dispatchEvent(new KeyboardEvent(type, { key: 'Shift', code }));

  it('keeps a modifier active while another key bound to it is still held', () => {
    key('keydown', 'ShiftLeft');
    key('keydown', 'ShiftRight');
    key('keyup', 'ShiftLeft');

    expect(service.isActiveModifier('panActivation')).toBe(true);
  });

  it('releases a modifier once every key bound to it is released', () => {
    key('keydown', 'ShiftLeft');
    key('keydown', 'ShiftRight');
    key('keyup', 'ShiftLeft');
    key('keyup', 'ShiftRight');

    expect(service.isActiveModifier('panActivation')).toBe(false);
  });

  it('deactivates a held modifier at once when its keys are configured away', () => {
    key('keydown', 'ShiftLeft');
    expect(service.isActiveModifier('panActivation')).toBe(true);

    shortcuts.set({ modifiers: { panActivation: [] } });

    expect(service.isActiveModifier('panActivation')).toBe(false);
  });

  it('releases every held key when the window loses focus', () => {
    key('keydown', 'ShiftLeft');
    expect(service.isActiveModifier('selection')).toBe(true);

    window.dispatchEvent(new Event('blur'));

    expect(service.isActiveModifier('selection')).toBe(false);
  });
});
