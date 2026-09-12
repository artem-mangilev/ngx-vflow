import { Directive, input } from '@angular/core';

/** A BPMN event outline. The consumer supplies its symbol and accessible name. */
@Directive({ selector: '[vflowBpmnEvent]', host: { class: 'vui-bpmn-event', '[attr.data-event]': 'vflowBpmnEvent()' } })
export class VflowBpmnEvent {
  readonly vflowBpmnEvent = input<'start' | 'intermediate' | 'end'>('start');
}

/** A diamond outline that leaves the consumer's text and handle coordinates unrotated. */
@Directive({ selector: '[vflowBpmnGateway]', host: { class: 'vui-bpmn-gateway' } })
export class VflowBpmnGateway {}
