import { TestBed } from '@angular/core/testing';
import { DescriptionService } from './description.service';

describe('DescriptionService', () => {
  let service: DescriptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [DescriptionService] });
    service = TestBed.inject(DescriptionService);
  });

  const text = (element: Element) =>
    (element.getAttribute('aria-describedby') ?? '')
      .split(' ')
      .map((id) => document.getElementById(id)?.textContent)
      .join('|');

  it('describes an element with an element that holds the text', () => {
    const element = document.createElement('div');

    service.describe(element, 'Selected.');

    expect(text(element)).toBe('Selected.');
  });

  it('shares one description element between elements with the same text', () => {
    const a = document.createElement('div');
    const b = document.createElement('div');

    service.describe(a, 'Selected.');
    service.describe(b, 'Selected.');

    const id = a.getAttribute('aria-describedby')!;
    expect(b.getAttribute('aria-describedby')).toBe(id);
    expect(document.querySelectorAll(`[id="${id}"]`).length).toBe(1);
  });

  it('keeps the ids the application put into aria-describedby', () => {
    const element = document.createElement('div');
    element.setAttribute('aria-describedby', 'app-hint');

    const undescribe = service.describe(element, 'Selected.');
    const [appId, ownId] = element.getAttribute('aria-describedby')!.split(' ');
    expect(appId).toBe('app-hint');
    expect(document.getElementById(ownId)?.textContent).toBe('Selected.');

    undescribe();
    expect(element.getAttribute('aria-describedby')).toBe('app-hint');
  });

  it('keeps a shared description element until its last element is undescribed', () => {
    const a = document.createElement('div');
    const b = document.createElement('div');
    const undescribeA = service.describe(a, 'Selected.');
    const undescribeB = service.describe(b, 'Selected.');
    const id = b.getAttribute('aria-describedby')!;

    undescribeA();
    expect(document.getElementById(id)).not.toBeNull();

    undescribeB();
    expect(b.hasAttribute('aria-describedby')).toBe(false);
    expect(document.getElementById(id)).toBeNull();
  });

  it('describes nothing with blank text', () => {
    const element = document.createElement('div');

    service.describe(element, '  ');

    expect(element.hasAttribute('aria-describedby')).toBe(false);
  });

  it('removes its description elements when the flow is destroyed', () => {
    const element = document.createElement('div');
    service.describe(element, 'Parent: Stage.');
    const id = element.getAttribute('aria-describedby')!;

    TestBed.resetTestingModule();

    expect(document.getElementById(id)).toBeNull();
  });
});
