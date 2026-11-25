import { DOCUMENT } from '@angular/common';
import { Injectable, OnDestroy, inject } from '@angular/core';

/** Ids of description elements are unique in the document, across flows. */
let nextId = 0;

/**
 * The descriptions of the entities of one flow, as `aria-describedby` references to hidden elements, one per distinct
 * text. A referenced element is read by assistive technology even when it is hidden.
 */
@Injectable()
export class DescriptionService implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private container: HTMLElement | null = null;
  private readonly messages = new Map<string, { element: HTMLElement; count: number }>();

  /** Describes the element with the text; returns the function that removes the description. Nothing for no text. */
  public describe(element: Element, text: string): () => void {
    if (!text.trim()) return () => undefined;

    let message = this.messages.get(text);
    if (!message) {
      const node = this.document.createElement('div');
      node.id = `v-description-${nextId++}`;
      node.textContent = text;
      this.containerElement().appendChild(node);
      message = { element: node, count: 0 };
      this.messages.set(text, message);
    }
    message.count++;
    setReference(element, message.element.id, true);

    const entry = message;
    return () => {
      setReference(element, entry.element.id, false);
      if (--entry.count > 0) return;
      entry.element.remove();
      this.messages.delete(text);
    };
  }

  public ngOnDestroy(): void {
    this.container?.remove();
    this.container = null;
    this.messages.clear();
  }

  private containerElement(): HTMLElement {
    if (!this.container) {
      this.container = this.document.createElement('div');
      this.container.hidden = true;
      this.document.body.appendChild(this.container);
    }
    return this.container;
  }
}

/** Adds or removes one id of `aria-describedby`, keeping the ids the application set. */
function setReference(element: Element, id: string, present: boolean): void {
  const ids = (element.getAttribute('aria-describedby') ?? '').split(/\s+/).filter((other) => other && other !== id);
  if (present) ids.push(id);
  if (ids.length) element.setAttribute('aria-describedby', ids.join(' '));
  else element.removeAttribute('aria-describedby');
}
