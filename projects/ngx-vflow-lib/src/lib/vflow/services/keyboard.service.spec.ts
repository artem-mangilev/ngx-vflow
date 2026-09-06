import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KeyboardService } from './keyboard.service';

describe('viewport activation shortcuts', () => {
  it('keeps alternative keys active until all are released and applies null immediately', () => {
    TestBed.configureTestingModule({ providers: [KeyboardService, provideExperimentalZonelessChangeDetection()] });
    const service = TestBed.inject(KeyboardService);
    service.setShortcuts({ pan: ['ShiftLeft', 'ShiftRight'] });
    for (const code of ['ShiftLeft', 'ShiftRight']) {
      document.dispatchEvent(new KeyboardEvent('keydown', { code }));
    }
    document.dispatchEvent(new KeyboardEvent('keyup', { code: 'ShiftLeft' }));
    expect(service.isActiveAction('pan')).toBeTrue();
    service.setShortcuts({ pan: null });
    expect(service.isActiveAction('pan')).toBeFalse();
    window.dispatchEvent(new Event('blur'));
    expect(service.isActiveAction('selection')).toBeFalse();
  });
});
