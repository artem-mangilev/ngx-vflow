import { Directive } from '@angular/core';

/** Prevent node dragging and viewport panning from this element and its descendants. */
@Directive({ selector: '[vNoDrag]', standalone: true, host: { 'data-v-no-drag': '' } })
export class VflowNoDragDirective {}

/** Prevent viewport panning from this element and its descendants. */
@Directive({ selector: '[vNoPan]', standalone: true, host: { 'data-v-no-pan': '' } })
export class VflowNoPanDirective {}

/** Leave wheel and trackpad pinch handling to this element and its descendants. */
@Directive({ selector: '[vNoWheel]', standalone: true, host: { 'data-v-no-wheel': '' } })
export class VflowNoWheelDirective {}

/** Leave keyboard commands to this element and its descendants; native Tab traversal is preserved. */
@Directive({ selector: '[vNoKeyboard]', standalone: true, host: { 'data-v-no-keyboard': '' } })
export class VflowNoKeyboardDirective {}

/** A click that starts on this element or its descendants does not select the node or edge around it. */
@Directive({ selector: '[vNoSelect]', standalone: true, host: { 'data-v-no-select': '' } })
export class VflowNoSelectDirective {}
