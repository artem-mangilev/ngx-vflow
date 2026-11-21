import { TestBed } from '@angular/core/testing';
import { DescriptionService } from './description.service';

describe('DescriptionService', () => {
  function setup() {
    TestBed.configureTestingModule({ providers: [DescriptionService] });
    return TestBed.inject(DescriptionService);
  }

  const text = (element: Element) =>
    (element.getAttribute('aria-describedby') ?? '')
      .split(' ')
      .map((id) => document.getElementById(id)?.textContent)
      .join('|');

  it('shares one element per text, keeps the ids of the application and removes the last reference', () => {
    const service = setup();
    const a = document.createElement('div');
    const b = document.createElement('div');
    a.setAttribute('aria-describedby', 'app-hint');

    const undescribeA = service.describe(a, 'Selected.');
    const undescribeB = service.describe(b, 'Selected.');
    const id = b.getAttribute('aria-describedby')!;

    expect(a.getAttribute('aria-describedby')).toBe(`app-hint ${id}`);
    expect(text(b)).toBe('Selected.');
    expect(document.querySelectorAll(`[id="${id}"]`).length).toBe(1);

    undescribeA();
    expect(a.getAttribute('aria-describedby')).toBe('app-hint');
    expect(document.getElementById(id)).not.toBeNull();

    undescribeB();
    expect(b.hasAttribute('aria-describedby')).toBe(false);
    expect(document.getElementById(id)).toBeNull();
  });

  it('describes nothing without text and removes its elements when the flow is destroyed', () => {
    const service = setup();
    const element = document.createElement('div');

    service.describe(element, '  ');
    expect(element.hasAttribute('aria-describedby')).toBe(false);

    service.describe(element, 'Parent: Stage.');
    const id = element.getAttribute('aria-describedby')!;
    TestBed.resetTestingModule();
    expect(document.getElementById(id)).toBeNull();
  });
});
