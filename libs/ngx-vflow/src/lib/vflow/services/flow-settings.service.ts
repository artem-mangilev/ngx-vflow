import { AutoPanSettings } from '../interfaces/auto-pan-settings.interface';
import { Injectable, Signal, signal } from '@angular/core';
import { Background } from '../types/background.type';
import { DEFAULT_OPTIMIZATION, Optimization } from '../interfaces/optimization.interface';
import { SelectionMode } from '../types/selection-mode.type';
import { DEFAULT_SELECTION_BOX, SelectionBoxSettings } from '../interfaces/selection-box-settings.interface';
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

  /**
   * @see {VflowComponent.view}
   */
  public view = bindableSignal<[number, number] | 'auto'>('auto');

  /**
   * Set based on view property. May change if view is 'auto'
   */
  public computedFlowWidth = signal(0);

  /**
   * Set based on view property. May change if view is 'auto'
   */
  public computedFlowHeight = signal(0);

  public zoomOnScroll = bindableSignal(true);
  public zoomOnPinch = bindableSignal(true);
  public zoomOnDoubleClick = bindableSignal(false);
  /** true preserves panning with any mouse button; arrays restrict mouse buttons only. */
  public panOnDrag = bindableSignal<boolean | number[]>(true);
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

  public optimization = bindableSignal<Required<Optimization>>(DEFAULT_OPTIMIZATION);

  public selectionMode = bindableSignal<SelectionMode>('default');

  public selectionBox = bindableSignal<Required<SelectionBoxSettings>>(DEFAULT_SELECTION_BOX);

  /** Reads every given setting from its source signal from now on. */
  public bind(sources: FlowSettingsSources) {
    for (const [key, source] of Object.entries(sources) as [keyof FlowSettingsSources, Signal<unknown>][]) {
      (this[key] as BindableSignal<unknown>).bind(source);
    }
  }
}
