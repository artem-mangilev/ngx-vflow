import { Directive } from '@angular/core';

/** Prevent node dragging and viewport panning from this element and its descendants. */
@Directive({ selector: '[vflowNoDrag]', standalone: true, host: { 'data-vflow-no-drag': '' } })
export class NoDragDirective {}

/** Prevent viewport panning from this element and its descendants. */
@Directive({ selector: '[vflowNoPan]', standalone: true, host: { 'data-vflow-no-pan': '' } })
export class NoPanDirective {}

/** Leave wheel and trackpad pinch handling to this element and its descendants. */
@Directive({ selector: '[vflowNoWheel]', standalone: true, host: { 'data-vflow-no-wheel': '' } })
export class NoWheelDirective {}
