import { Injectable, inject } from '@angular/core';
import { ViewportService } from './viewport.service';
import { FlowSettingsService } from './flow-settings.service';
import { AnnouncerService } from './announcer.service';
import { ArrowCommand } from '../utils/keyboard-commands';

/** Screen pixels per arrow press when panning; Shift multiplies by 4, as it does for node movement. */
const PAN_STEP = 15;
/** Multiplicative zoom step per press, the same as the `vflow-controls` buttons. */
const ZOOM_STEP = 1.2;

/** What the keyboard commands of the viewport do. They take every press they are given. */
@Injectable()
export class KeyboardViewportCommandsService {
  private viewport = inject(ViewportService);
  private settings = inject(FlowSettingsService);
  private announcer = inject(AnnouncerService);

  public pan(direction: ArrowCommand, fast: boolean) {
    const { x, y } = this.viewport.readableViewport();
    const step = PAN_STEP * (fast ? 4 : 1);
    // Arrows scroll the view: pressing right reveals what lies to the right, so the content moves left.
    this.viewport.writableViewport.set({
      changeType: 'absolute',
      state: { x: x - direction.vector.x * step, y: y - direction.vector.y * step },
      duration: 0,
    });
    return true;
  }

  public zoom(step: 1 | -1) {
    const zoom = Math.min(
      this.settings.maxZoom(),
      Math.max(this.settings.minZoom(), this.viewport.readableViewport().zoom * ZOOM_STEP ** step),
    );
    this.viewport.writableViewport.set({ changeType: 'absolute', state: { zoom }, duration: 0 });
    this.announcer.announce(this.settings.ariaLabels().zoomAnnouncement(zoom));
    return true;
  }

  public fitView() {
    const state = this.viewport.fitView({ padding: 0.1, duration: 0 });
    if (state) this.announcer.announce(this.settings.ariaLabels().zoomAnnouncement(state.zoom));
    return true;
  }
}
