import { SelectionBoxMode } from '../types/selection-box-mode.type';

export const DEFAULT_SELECTION_BOX: Required<SelectionBoxSettings> = { mode: 'full' };

export interface SelectionBoxSettings {
  /** `'full'` selects only fully enclosed entities, `'partial'` those that intersect the box. Default: `'full'`. */
  mode?: SelectionBoxMode;
}
