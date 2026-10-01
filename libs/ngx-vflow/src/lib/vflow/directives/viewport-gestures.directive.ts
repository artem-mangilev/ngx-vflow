import { Directive, ElementRef, NgZone, OnDestroy, OnInit, computed, inject } from '@angular/core';
import { ViewportService } from '../services/viewport.service';
import { ViewportChange, ViewportState } from '../interfaces/viewport.interface';
import { SelectionService } from '../services/selection.service';
import { FlowSettingsService } from '../services/flow-settings.service';
import { KeyboardService } from '../services/keyboard.service';
import { allowRootZoomForNodeTarget } from '../utils/allow-root-zoom-for-node-target';
import { Point } from '../interfaces/point.interface';
import { PointerDrag, createPointerDrag } from '../gestures/pointer-drag';
import { clampZoom, panePointFromClient, toFlowPoint, translateBy, zoomAround } from '../gestures/viewport-transform';
import { wheelPanDelta, wheelZoomFactor } from '../gestures/wheel';
import { ViewportAnimation, animateViewport } from '../gestures/viewport-animation';
import { TouchAnchor, touchCenter, touchViewport } from '../gestures/pinch';

/** A wheel gesture ends when no wheel event arrives for this long and the zoom has settled. */
const WHEEL_IDLE_MS = 150;
/** Time constant of the wheel zoom easing: the remaining distance to the target shrinks by e every this many ms. */
const WHEEL_ZOOM_TAU_MS = 60;
/** Nominal age of the first easing step, so that a wheel event moves the viewport within its own frame. */
const WHEEL_ZOOM_FIRST_STEP_MS = 16;
/** The easing snaps to its target within this distance, in natural-log zoom units (0.1 %). */
const WHEEL_ZOOM_EPSILON = 1e-3;
/** Duration of the double-click zoom animation. */
const DOUBLE_CLICK_DURATION_MS = 250;
/** A second tap within this time after the first press is a double tap. */
const DOUBLE_TAP_DELAY_MS = 500;
/** A double tap ends within this pane distance of the first tap. */
const DOUBLE_TAP_DISTANCE = 10;

const NO_WHEEL = '[data-vflow-no-wheel]';
const NO_PAN = '[data-vflow-no-pan], [data-vflow-no-drag]';

/** A wheel zoom in progress: the events set the target, animation frames move the viewport towards it. */
interface WheelZoom {
  target: number;
  /** Pane point whose flow point stays in place: the pointer at the latest wheel event. */
  anchor: Point;
  /** Time of the previous easing step. */
  last: number;
}

interface TouchGesture {
  /** At most two touches take part, in the order they joined. */
  anchors: Map<number, TouchAnchor>;
  target: EventTarget | null;
  taps: number;
  /** Middle of the touches when their number last changed; a pinch without panning zooms around it. */
  pinchCenter: Point;
}

/**
 * Viewport gestures of the pane: drag panning with a mouse or pen, touch panning and pinch, wheel zoom, scroll
 * panning and double-click zoom, and the programmatic viewport changes requested through {@link ViewportService}.
 *
 * Every change of the viewport belongs to a gesture. Nested gestures, such as a programmatic change during a drag,
 * report one start and one end, the way the gesture policy and pane-click selection expect them.
 */
@Directive({
  standalone: true,
  selector: 'div[viewportGestures]',
  host: {
    '[style.touch-action]': 'touchAction()',
  },
})
export class ViewportGesturesDirective implements OnInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly selectionService = inject(SelectionService);
  private readonly viewportService = inject(ViewportService);
  private readonly settings = inject(FlowSettingsService);
  private readonly keyboard = inject(KeyboardService);
  private readonly zone = inject(NgZone);

  /**
   * Touches the flow takes over must not scroll the page. Without touch panning one finger scrolls the page and two
   * fingers still reach the pinch gesture.
   */
  protected readonly touchAction = computed(() =>
    this.settings.panOnDrag() !== false ? 'none' : this.settings.zoomOnPinch() ? 'pan-x pan-y' : 'auto',
  );

  private readonly listeners = new AbortController();
  private drag?: PointerDrag;
  private destroyed = false;

  private activeGestures = 0;
  private gestureStart: ViewportState | null = null;
  private animation: ViewportAnimation | null = null;
  /** Where the animation in progress leads; a programmatic change continues from there. */
  private animationTarget: ViewportState | null = null;
  /** Reports the end of the programmatic change the animation in progress belongs to. */
  private animationDone: ((reached: boolean) => void) | null = null;

  private wheelTimer: ReturnType<typeof setTimeout> | null = null;
  private wheelZoom: WheelZoom | null = null;
  private wheelFrame: number | null = null;
  private wheelTarget: EventTarget | null = null;

  private dragTarget: EventTarget | null = null;
  private dragPoint: Point | null = null;

  /** Every touch that pressed the pane and has not been released. */
  private readonly touches = new Map<number, { pane: Point; target: EventTarget | null }>();
  private touchGesture: TouchGesture | null = null;
  private tapStartedAt: number | null = null;
  private firstTap: Point | null = null;
  private lastTouchEndedAt = -Infinity;

  private readonly disconnect = this.viewportService.connect((change) => this.applyChange(change));

  public ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      const { signal } = this.listeners;
      this.host.addEventListener('wheel', (event) => this.onWheel(event), { passive: false, signal });
      this.host.addEventListener('dblclick', (event) => this.onDoubleClick(event), { signal });
      this.host.addEventListener('pointerdown', (event) => this.onTouchDown(event), { signal });

      this.drag = createPointerDrag(this.host, {
        filter: (event) => event.pointerType !== 'touch' && this.dragFilter(event),
        capture: true,
        clickDistance: () => 0,
        stopCompatibilityEvents: true,
        onStart: ({ event }) => {
          this.interruptAnimation();
          this.begin();
          this.dragTarget = event.target;
          this.dragPoint = this.panePoint(event);
        },
        onMove: ({ event }) => {
          const point = this.panePoint(event);
          const previous = this.dragPoint ?? point;
          this.dragPoint = point;
          this.set(translateBy(this.current(), point.x - previous.x, point.y - previous.y));
        },
        onEnd: () => this.endDrag(),
        onCancel: () => this.endDrag(),
      });
    });
  }

  public ngOnDestroy(): void {
    this.destroyed = true;
    this.disconnect();
    this.listeners.abort();
    this.drag?.destroy();
    if (this.wheelTimer !== null) clearTimeout(this.wheelTimer);
    if (this.wheelFrame !== null) cancelAnimationFrame(this.wheelFrame);
    this.wheelZoom = null;
    this.interruptAnimation();
    this.stopTrackingTouches();
  }

  // #region Programmatic changes
  /**
   * A change continues from where the previous one leads: the target of an animation in progress, or the viewport.
   * It reports that it reached its target once it lands there; an interrupted animation reports that it did not.
   */
  private applyChange({ target, duration, done }: ViewportChange) {
    const previousTarget = this.animationTarget;
    this.interruptAnimation();
    const to = target(previousTarget ?? this.current(), this.paneCenter());
    if (!to) {
      done(false);
      return;
    }

    if (duration > 0) {
      this.animate(to, duration, () => this.paneCenter(), null, done);
    } else {
      this.begin();
      this.set(to);
      this.finish(null);
      done(true);
    }
  }

  private animate(
    to: ViewportState,
    duration: number,
    anchor: () => Point,
    eventTarget: EventTarget | null,
    done: ((reached: boolean) => void) | null = null,
  ) {
    this.interruptAnimation();
    const animation: ViewportAnimation = this.zone.runOutsideAngular(() =>
      animateViewport({
        duration,
        current: () => this.current(),
        target: () => to,
        anchor,
        size: () => Math.max(this.host.clientWidth, this.host.clientHeight),
        onStart: () => this.begin(),
        onFrame: (state) => this.set(state),
        onEnd: () => {
          const reached = this.animation === animation;
          if (reached) {
            this.animation = null;
            this.animationTarget = null;
            this.animationDone = null;
          }
          this.finish(eventTarget);
          if (reached) done?.(true);
        },
      }),
    );
    this.animation = animation;
    this.animationTarget = to;
    this.animationDone = done;
  }

  private interruptAnimation() {
    const animation = this.animation;
    const done = this.animationDone;
    this.animation = null;
    this.animationTarget = null;
    this.animationDone = null;
    animation?.interrupt();
    done?.(false);
    this.landWheelZoom();
  }
  // #endregion

  // #region Mouse and pen drag
  private dragFilter(event: PointerEvent) {
    const selecting = this.keyboard.isActiveModifier('selection');
    if (!allowRootZoomForNodeTarget(event, selecting)) return false;
    const buttons = this.settings.panOnDrag();
    return this.dragPanning() && (!Array.isArray(buttons) || buttons.includes(event.button));
  }

  private endDrag() {
    const target = this.dragTarget;
    this.dragTarget = null;
    this.dragPoint = null;
    this.finish(target);
  }
  // #endregion

  // #region Wheel
  private onWheel(event: WheelEvent) {
    if (this.excluded(event, NO_WHEEL)) return;

    if (!event.ctrlKey && this.scrollPanning()) {
      if (this.keyboard.isActiveModifier('selection') || this.excluded(event, NO_PAN)) return;
      event.preventDefault();
      const delta = wheelPanDelta(event, this.host.clientHeight);
      this.interruptAnimation();
      this.begin();
      this.set(translateBy(this.current(), delta.x, delta.y));
      this.finish(null);
      return;
    }

    const allowed = event.ctrlKey
      ? this.settings.zoomOnPinch()
      : this.keyboard.isActiveModifier('zoomActivation') || this.settings.zoomOnScroll();
    if (!allowed) return;

    // Each event moves the target by its step; a zoom still easing towards its target accumulates.
    const from = this.wheelZoom?.target ?? this.current().zoom;
    const zoom = this.clamp(from * wheelZoomFactor(event));

    if (this.wheelTimer !== null) {
      clearTimeout(this.wheelTimer);
    } else if (zoom === from) {
      // A new gesture that cannot zoom leaves the event to the page, which can scroll at a zoom limit.
      return;
    } else {
      this.interruptAnimation();
      this.begin();
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    this.wheelTarget = event.target;
    this.wheelTimer = setTimeout(() => {
      this.wheelTimer = null;
      this.finishWheel();
    }, WHEEL_IDLE_MS);
    const anchor = this.panePoint(event);
    if (event.ctrlKey) {
      // A pinch is direct manipulation: it follows the fingers at once.
      this.landWheelZoom();
      this.set(zoomAround(this.current(), zoom, anchor));
    } else if (this.wheelZoom) {
      Object.assign(this.wheelZoom, { target: zoom, anchor });
    } else {
      // The first step runs within the event, so the response is immediate; the rest follow on animation frames.
      this.wheelZoom = { target: zoom, anchor, last: performance.now() - WHEEL_ZOOM_FIRST_STEP_MS };
      this.stepWheelZoom(performance.now());
    }
  }

  /**
   * Wheel zoom eases towards its target, so a mouse wheel notch glides instead of jumping and a burst of trackpad
   * events costs one viewport update per frame. Each step covers the share of the remaining distance that the
   * elapsed time earns.
   */
  private stepWheelZoom(now: number) {
    const state = this.wheelZoom;
    if (!state || this.destroyed) return;
    const current = this.current();
    const remaining = Math.log(state.target / current.zoom);
    if (Math.abs(remaining) < WHEEL_ZOOM_EPSILON) {
      this.landWheelZoom();
      return;
    }
    const zoom = current.zoom * Math.exp(remaining * (1 - Math.exp((state.last - now) / WHEEL_ZOOM_TAU_MS)));
    state.last = now;
    this.set(zoomAround(current, zoom, state.anchor));
    this.wheelFrame = this.zone.runOutsideAngular(() =>
      requestAnimationFrame((time) => {
        this.wheelFrame = null;
        this.stepWheelZoom(time);
      }),
    );
  }

  /** Lands the viewport on the target, whether the easing got there or another gesture takes over. */
  private landWheelZoom() {
    const state = this.wheelZoom;
    if (!state) return;
    if (this.wheelFrame !== null) cancelAnimationFrame(this.wheelFrame);
    this.wheelFrame = null;
    this.wheelZoom = null;
    this.set(zoomAround(this.current(), state.target, state.anchor));
    this.finishWheel();
  }

  /** The wheel gesture ends once the events stopped and the easing settled, whichever comes last. */
  private finishWheel() {
    if (this.wheelTimer !== null || this.wheelZoom !== null) return;
    const target = this.wheelTarget;
    this.wheelTarget = null;
    this.finish(target);
  }
  // #endregion

  // #region Double click
  private onDoubleClick(event: MouseEvent) {
    if (!this.settings.zoomOnDoubleClick()) return;
    // A touch double tap zooms on its own; the double click some browsers dispatch after it is not another one.
    if (performance.now() - this.lastTouchEndedAt < DOUBLE_TAP_DELAY_MS) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    this.doubleClickZoom(this.panePoint(event), event.shiftKey, event.target);
  }

  private doubleClickZoom(point: Point, out: boolean, target: EventTarget | null) {
    const current = this.current();
    const to = zoomAround(current, this.clamp(current.zoom * (out ? 0.5 : 2)), point);
    this.animate(to, DOUBLE_CLICK_DURATION_MS, () => point, target);
  }
  // #endregion

  // #region Touch
  private onTouchDown(event: PointerEvent) {
    if (event.pointerType !== 'touch') return;
    if (this.touches.size === 0) this.startTrackingTouches();
    this.touches.set(event.pointerId, { pane: this.panePoint(event), target: event.target });

    if (!this.touchFilter(event, this.touches.size)) return;
    event.stopPropagation();
    this.host.addEventListener('touchstart', stopOnce, { once: true });

    const now = performance.now();
    const tapPending = this.tapStartedAt !== null && now - this.tapStartedAt < DOUBLE_TAP_DELAY_MS;
    this.tapStartedAt = null;
    const current = this.current();
    const started = this.touchGesture === null;
    const gesture: TouchGesture = (this.touchGesture ??= {
      anchors: new Map(),
      target: event.target,
      taps: 0,
      pinchCenter: { x: 0, y: 0 },
    });
    const joined = gesture.anchors.size;

    // Touches that pressed the pane earlier, when a single one was not enough, join the gesture now.
    for (const [id, touch] of this.touches) {
      if (gesture.anchors.size >= 2) break;
      if (gesture.anchors.has(id)) continue;
      gesture.anchors.set(id, { pane: touch.pane, flow: toFlowPoint(current, touch.pane) });
      gesture.taps = gesture.anchors.size === 1 ? 1 + (tapPending ? 1 : 0) : 0;
    }

    if (gesture.anchors.size !== joined) gesture.pinchCenter = touchCenter([...gesture.anchors.values()]);

    if (started) {
      if (gesture.taps < 2) {
        this.tapStartedAt = now;
        this.firstTap = this.touches.get(event.pointerId)!.pane;
      }
      this.interruptAnimation();
      this.begin();
    }
  }

  private onTouchMove = (event: PointerEvent) => {
    const touch = this.touches.get(event.pointerId);
    if (!touch) return;
    touch.pane = this.panePoint(event);

    const gesture = this.touchGesture;
    const anchor = gesture?.anchors.get(event.pointerId);
    if (!gesture || !anchor) return;
    anchor.pane = touch.pane;

    const anchors = [...gesture.anchors.values()];
    const next = touchViewport(this.current(), anchors, gesture.pinchCenter, {
      pan: this.dragPanning() && !this.excludedTarget(touch.target, NO_PAN),
      zoom: this.settings.zoomOnPinch(),
      minZoom: this.settings.minZoom(),
      maxZoom: this.settings.maxZoom(),
    });
    this.set(next);
  };

  private onTouchEnd = (event: PointerEvent) => {
    if (!this.touches.delete(event.pointerId)) return;
    if (this.touches.size === 0) this.stopTrackingTouches();

    const gesture = this.touchGesture;
    if (!gesture?.anchors.delete(event.pointerId)) return;
    this.lastTouchEndedAt = performance.now();

    if (gesture.anchors.size > 0) {
      // The remaining finger holds whatever flow point is under it now.
      const current = this.current();
      for (const anchor of gesture.anchors.values()) anchor.flow = toFlowPoint(current, anchor.pane);
      gesture.pinchCenter = touchCenter([...gesture.anchors.values()]);
      return;
    }

    this.touchGesture = null;
    this.host.removeEventListener('touchstart', stopOnce);
    this.finish(gesture.target);

    const point = this.panePoint(event);
    if (
      gesture.taps === 2 &&
      this.firstTap &&
      Math.hypot(this.firstTap.x - point.x, this.firstTap.y - point.y) < DOUBLE_TAP_DISTANCE &&
      this.settings.zoomOnDoubleClick() &&
      !this.keyboard.isActiveModifier('selection') &&
      this.dragPanning()
    ) {
      this.doubleClickZoom(point, false, event.target);
    }
  };

  private onTouchBlur = () => {
    this.touches.clear();
    this.stopTrackingTouches();
    const gesture = this.touchGesture;
    if (!gesture) return;
    this.touchGesture = null;
    this.host.removeEventListener('touchstart', stopOnce);
    this.finish(gesture.target);
  };

  private touchFilter(event: PointerEvent, touches: number) {
    const selecting = this.keyboard.isActiveModifier('selection');
    const panTarget = allowRootZoomForNodeTarget(event, selecting);
    return !selecting && ((panTarget && this.dragPanning()) || (touches > 1 && this.settings.zoomOnPinch()));
  }

  private startTrackingTouches() {
    const view = this.host.ownerDocument.defaultView ?? window;
    view.addEventListener('pointermove', this.onTouchMove, true);
    view.addEventListener('pointerup', this.onTouchEnd, true);
    view.addEventListener('pointercancel', this.onTouchEnd, true);
    view.addEventListener('blur', this.onTouchBlur);
  }

  private stopTrackingTouches() {
    const view = this.host.ownerDocument.defaultView ?? window;
    view.removeEventListener('pointermove', this.onTouchMove, true);
    view.removeEventListener('pointerup', this.onTouchEnd, true);
    view.removeEventListener('pointercancel', this.onTouchEnd, true);
    view.removeEventListener('blur', this.onTouchBlur);
  }
  // #endregion

  // #region Gesture lifecycle
  private begin() {
    if (this.activeGestures++ === 0) this.gestureStart = this.current();
  }

  private finish(target: EventTarget | null) {
    if (this.activeGestures === 0 || --this.activeGestures > 0) return;
    const start = this.gestureStart ?? this.current();
    this.gestureStart = null;
    if (this.destroyed) return;

    this.zone.run(() => {
      this.viewportService.triggerViewportChangeEvent('end');
      this.selectionService.setViewport({
        start,
        end: this.current(),
        target: target instanceof Element ? target : undefined,
      });
    });
  }

  private set(state: ViewportState) {
    this.viewportService.readableViewport.set(state);
  }

  private current() {
    return this.viewportService.readableViewport();
  }
  // #endregion

  // #region Settings
  private clamp(zoom: number) {
    return clampZoom(zoom, this.settings.minZoom(), this.settings.maxZoom());
  }

  private dragPanning() {
    return this.keyboard.isActiveModifier('panActivation') || this.settings.panOnDrag() !== false;
  }

  private scrollPanning() {
    return (
      (this.settings.panOnScroll() || this.keyboard.isActiveModifier('panActivation')) &&
      !this.keyboard.isActiveModifier('zoomActivation')
    );
  }

  private excluded(event: Event, selector: string) {
    return this.excludedTarget(event.target, selector);
  }

  private excludedTarget(target: EventTarget | null, selector: string) {
    return target instanceof Element && !!target.closest(selector);
  }

  private panePoint(event: MouseEvent): Point {
    return panePointFromClient(this.host, { x: event.clientX, y: event.clientY });
  }

  private paneCenter(): Point {
    return { x: this.host.clientWidth / 2, y: this.host.clientHeight / 2 };
  }
  // #endregion
}

function stopOnce(event: Event) {
  event.stopPropagation();
}
