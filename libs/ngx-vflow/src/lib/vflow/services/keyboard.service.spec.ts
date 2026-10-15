import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KeyboardService } from './keyboard.service';
import { KeyboardShortcuts } from '../types/keyboard-shortcuts.type';

describe('viewport activation shortcuts', () => {
  it('keeps alternative keys active until all are released and applies an empty list immediately', () => {
    TestBed.configureTestingModule({ providers: [KeyboardService] });
    const service = TestBed.inject(KeyboardService);
    const shortcuts = signal<KeyboardShortcuts>({ modifiers: { panActivation: ['Shift'] } });
    service.bindShortcuts(shortcuts);
    for (const code of ['ShiftLeft', 'ShiftRight']) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', code }));
    }
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Shift', code: 'ShiftLeft' }));
    expect(service.isActiveModifier('panActivation')).toBe(true);
    shortcuts.set({ modifiers: { panActivation: [] } });
    expect(service.isActiveModifier('panActivation')).toBe(false);
    window.dispatchEvent(new Event('blur'));
    expect(service.isActiveModifier('selection')).toBe(false);
  });
});
