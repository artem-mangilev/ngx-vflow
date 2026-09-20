import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KeyboardService } from './keyboard.service';

describe('viewport activation shortcuts', () => {
  it('keeps alternative keys active until all are released and applies an empty list immediately', () => {
    TestBed.configureTestingModule({ providers: [KeyboardService, provideZonelessChangeDetection()] });
    const service = TestBed.inject(KeyboardService);
    service.setShortcuts({ modifiers: { panActivation: ['Shift'] } });
    for (const code of ['ShiftLeft', 'ShiftRight']) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', code }));
    }
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Shift', code: 'ShiftLeft' }));
    expect(service.isActiveModifier('panActivation')).toBeTrue();
    service.setShortcuts({ modifiers: { panActivation: [] } });
    expect(service.isActiveModifier('panActivation')).toBeFalse();
    window.dispatchEvent(new Event('blur'));
    expect(service.isActiveModifier('selection')).toBeFalse();
  });
});
