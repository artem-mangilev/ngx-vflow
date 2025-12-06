import { FlowEntity } from './flow-entity.interface';
import { ViewportState } from './viewport.interface';

export interface SelectionContext {
  entities: FlowEntity[];
  isMultiSelectionActive: boolean;
}

export interface ViewportChangeContext {
  start: ViewportState;
  end: ViewportState;
  target: Element;
  delta: number;
}

export interface SelectionStrategy {
  select(entity: FlowEntity | null, context: SelectionContext): void;
  handleViewportChange(viewport: ViewportChangeContext, context: SelectionContext): void;
}
