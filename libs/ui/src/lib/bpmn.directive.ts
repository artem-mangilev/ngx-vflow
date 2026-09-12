import { Directive, input } from '@angular/core';

/** A BPMN event outline. The consumer supplies its symbol and accessible name. */
@Directive({
  selector: '[vflowBpmnEvent]',
  host: {
    class:
      'vui-bpmn-event vui:relative vui:box-border vui:grid vui:place-items-center vui:size-14 vui:rounded-full vui:border-2 vui:border-foreground vui:bg-surface vui:text-foreground vui:font-sans vui:text-base vui:data-[event=intermediate]:border-[5px] vui:data-[event=intermediate]:border-double vui:data-[event=end]:border-[5px] vui:data-[vui-selected=true]:outline-2 vui:data-[vui-selected=true]:outline-offset-2 vui:data-[vui-selected=true]:outline-accent vui:forced-colors:data-[vui-selected=true]:outline-[Highlight]',
    '[attr.data-event]': 'vflowBpmnEvent()',
  },
})
export class VflowBpmnEvent {
  readonly vflowBpmnEvent = input<'start' | 'intermediate' | 'end'>('start');
}

/** A diamond outline that leaves the consumer's text and handle coordinates unrotated. */
@Directive({
  selector: '[vflowBpmnGateway]',
  host: {
    class: `vui-bpmn-gateway vui:relative vui:isolate vui:grid vui:place-items-center vui:size-16 vui:text-[28px] vui:text-foreground vui:font-sans vui:before:content-[''] vui:before:absolute vui:before:-z-10 vui:before:box-border vui:before:size-[70.7107%] vui:before:rotate-45 vui:before:border-2 vui:before:border-foreground vui:before:bg-surface vui:data-[vui-selected=true]:before:outline-2 vui:data-[vui-selected=true]:before:outline-offset-2 vui:data-[vui-selected=true]:before:outline-accent vui:forced-colors:data-[vui-selected=true]:before:outline-[Highlight]`,
  },
})
export class VflowBpmnGateway {}
