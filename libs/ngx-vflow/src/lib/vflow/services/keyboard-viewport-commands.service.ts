import { Injectable, inject } from '@angular/core';
import { ViewportService, ZOOM_STEP } from './viewport.service';
import { FlowSettingsService } from './flow-settings.service';
import { AnnouncerService } from './announcer.service';
import { ArrowCommand } from '../utils/keyboard-commands';

/** Screen pixels per arrow press when panning; Shift multiplies by 4, as it does for node movement. */
const PAN_STEP = 15;

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
    this.viewport.change({ x: x - direction.vector.x * step, y: y - direction.vector.y * step });
    return true;
  }

  public zoom(step: 1 | -1) {
    this.viewport.zoomBy(ZOOM_STEP ** step).then(() => this.announceZoom());
    return true;
  }

  public fitView() {
    this.viewport.fitView({ padding: 0.1 }).then((fitted) => fitted && this.announceZoom());
    return true;
  }

  private announceZoom() {
    this.announcer.announce(this.settings.ariaLabels().zoomAnnouncement(this.viewport.readableViewport().zoom));
  }
}
