import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { PortalEntry } from '../../services/portal.service';

/** Renders the template of one `ng-template[vPortal]` in a portal layer, at its flow-space point. */
@Component({
  selector: 'div[portalHost]',
  template: `
    @if (entry().point()) {
      <ng-container [ngTemplateOutlet]="entry().templateRef" />
    }
  `,
  styles: [
    `
      :host {
        position: absolute;
        top: 0;
        left: 0;
        /* The layer has no size, so without this the content would shrink to its narrowest. */
        width: max-content;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
})
export class PortalHostComponent {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  public readonly entry = input.required<PortalEntry>();

  constructor() {
    // An effect, not a host binding: the point may follow a node through every frame of a drag.
    effect(() => {
      const point = this.entry().point();
      this.element.style.transform = point ? `translate(${point.x}px, ${point.y}px)` : '';
    });
  }
}
