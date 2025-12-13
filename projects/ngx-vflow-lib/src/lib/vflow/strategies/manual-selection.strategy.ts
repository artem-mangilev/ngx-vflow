import { SelectionStrategy } from '../interfaces/selection-strategy.interface';

export class ManualSelectionStrategy implements SelectionStrategy {
  select(): void {
    return;
    // noop - user manages selection manually
  }

  handleViewportChange(): void {
    return;
    // noop - user manages selection manually
  }
}
