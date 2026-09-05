import { Injectable, WritableSignal, signal } from '@angular/core';
import { Background } from '../types/background.type';
import { DEFAULT_OPTIMIZATION, Optimization } from '../interfaces/optimization.interface';
import { SelectionMode } from '../types/selection-mode.type';
import { SelectionBoxSettings } from '../interfaces/selection-box-settings.interface';

@Injectable()
export class FlowSettingsService {
  public nodesSelectable = signal(true);
  public edgesSelectable = signal(true);
  public nodesFocusable = signal(true);
  public edgesFocusable = signal(true);

  public elevateNodesOnSelect = signal(true);
  public elevateEdgesOnSelect = signal(true);
  public autoPan = signal(true);

  /**
   * @see {VflowComponent.view}
   */
  public view: WritableSignal<[number, number] | 'auto'> = signal([400, 400]);

  /**
   * Set based on view property. May change if view is 'auto'
   */
  public computedFlowWidth = signal(0);

  /**
   * Set based on view property. May change if view is 'auto'
   */
  public computedFlowHeight = signal(0);

  public zoomOnScroll = signal(true);
  public zoomOnPinch = signal(true);
  public zoomOnDoubleClick = signal(false);
  /** true preserves panning with any mouse button; arrays restrict mouse buttons only. */
  public panOnDrag = signal<boolean | number[]>(true);
  public panOnScroll = signal(false);
  public paneClickDistance = signal(6);
  public nodeDragThreshold = signal(0);
  public connectionDragThreshold = signal(0);

  public minZoom = signal(0.5);

  public maxZoom = signal(3);

  public background = signal<Background>({ type: 'solid', color: '#fff' });

  public snapGrid = signal<[number, number]>([1, 1]);

  public optimization = signal<Required<Optimization>>(DEFAULT_OPTIMIZATION);

  public selectionMode = signal<SelectionMode>('default');

  public selectionBox = signal<Required<SelectionBoxSettings>>({
    mode: 'full',
    color: '#bbe1fa',
  });
}
