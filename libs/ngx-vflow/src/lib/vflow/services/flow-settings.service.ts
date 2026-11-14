import { AutoPanSettings } from '../interfaces/auto-pan-settings.interface';
import { Injectable, Signal, signal } from '@angular/core';
import { Background } from '../types/background.type';
import { SelectionMode } from '../types/selection-mode.type';
import { SelectionBoxMode } from '../types/selection-box-mode.type';
import { LazyLoadTrigger } from '../types/lazy-load-trigger.type';
import { DEFAULT_ARIA_LABEL_CONFIG } from '../interfaces/aria-label-config.interface';
import { AlignmentHelperSettings } from '../interfaces/alignment-helper-settings.interface';
import { BindableSignal, bindableSignal } from '../utils/signals/bindable-signal';

/** Source signals for the settings, by setting name; `VflowComponent` binds its inputs with them. */
export type FlowSettingsSources = {
  [
    K in keyof FlowSettingsService as FlowSettingsService[K] extends BindableSignal<unknown> ? K : never
  ]?: FlowSettingsService[K] extends BindableSignal<infer T> ? Signal<T> : never;
};

@Injectable()
export class FlowSettingsService {
  public ariaLabels = bindableSignal(DEFAULT_ARIA_LABEL_CONFIG);
  public nodesSelectable = bindableSignal(true);
  public edgesSelectable = bindableSignal(true);
  public nodesFocusable = bindableSignal(true);
  public edgesFocusable = bindableSignal(true);

  public elevateNodesOnSelect = bindableSignal(true);
  public elevateEdgesOnSelect = bindableSignal(true);
  public autoPan = bindableSignal<boolean | AutoPanSettings>(true);
  public autoPanOnNodeFocus = bindableSignal(true);

  /** Measured width of the flow element in CSS pixels; the application sizes the element with CSS. */
  public computedFlowWidth = signal(0);

  /** Measured height of the flow element in CSS pixels. */
  public computedFlowHeight = signal(0);

  public zoomOnScroll = bindableSignal(true);
  public zoomOnPinch = bindableSignal(true);
  public zoomOnDoubleClick = bindableSignal(false);
  /** true preserves panning with any mouse button; arrays restrict mouse buttons only. */
  public panOnDrag = bindableSignal<boolean | readonly number[]>(true);
  public panOnScroll = bindableSignal(false);
  public paneClickDistance = bindableSignal(6);
  public nodeDragThreshold = bindableSignal(0);
  public connectionDragThreshold = bindableSignal(0);

  public minZoom = bindableSignal(0.5);

  public maxZoom = bindableSignal(3);

  /** Pattern drawn over the token-colored canvas; `null` draws no pattern. */
  public background = bindableSignal<Background | null>(null);

  public snapGrid = bindableSignal<[number, number]>([1, 1]);

  /** @see {VflowComponent.alignmentHelper} */
  public alignmentHelper = bindableSignal<AlignmentHelperSettings | boolean>(false);

  /** @see {VflowComponent.parentsBelowEdges} */
  public parentsBelowEdges = bindableSignal(false);

  /** @see {VflowComponent.virtualization} */
  public virtualization = bindableSignal(false);

  /** @see {VflowComponent.lazyLoadTrigger} */
  public lazyLoadTrigger = bindableSignal<LazyLoadTrigger>('immediate');

  public selectionMode = bindableSignal<SelectionMode>('default');

  public selectionBoxMode = bindableSignal<SelectionBoxMode>('full');

  /** Reads every given setting from its source signal from now on. */
  public bind(sources: FlowSettingsSources): void {
    for (const [key, source] of Object.entries(sources) as [keyof FlowSettingsSources, Signal<unknown>][]) {
      (this[key] as BindableSignal<unknown>).bind(source);
    }
  }
}
