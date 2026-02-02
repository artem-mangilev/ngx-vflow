import { computed, signal } from '@angular/core';
import { NodeHandle } from '../services/handle.service';
import { NodeModel } from './node.model';
import { Subject, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ElementCacheService } from '../services/element-cache.service';

export type HandleState = 'valid' | 'invalid' | 'idle';

export class HandleModel {
  public readonly strokeWidth = 2;

  /**
   * Pre-computed size for default handle, changed dynamically
   * for custom handles
   */
  public size = signal({
    width: 10 + 2 * this.strokeWidth,
    height: 10 + 2 * this.strokeWidth,
  });

  public pointAbsolute = computed(() => {
    return {
      x: this.parentNode.globalPoint().x + this.hostOffset().x + this.sizeOffset().x,
      y: this.parentNode.globalPoint().y + this.hostOffset().y + this.sizeOffset().y,
    };
  });

  public state = signal<HandleState>('idle');

  private updateHostSizeAndPosition$ = new Subject<void>();
  // TODO: for some reason toLazySignal breaks unit tests, so we use toSignal here
  private hostSize = toSignal(this.updateHostSizeAndPosition$.pipe(map(() => this.getHostSize())), {
    initialValue: { width: 0, height: 0 },
  });

  // TODO: for some reason toLazySignal breaks unit tests, so we use toSignal here
  private hostPosition = toSignal(
    this.updateHostSizeAndPosition$.pipe(
      map(() => {
        const offsets =
          this.hostReference instanceof HTMLElement
            ? this.elementCacheService.getElementData({ element: this.hostReference, type: 'htmlElement' })
            : undefined;

        return {
          x: offsets ? offsets.offsetLeft : 0, // for now just 0 for group nodes
          y: offsets ? offsets.offsetTop : 0, // for now just 0 for group nodes
        };
      }),
    ),
    {
      initialValue: { x: 0, y: 0 },
    },
  );

  public hostOffset = computed(() => {
    switch (this.rawHandle.position) {
      case 'left':
        return {
          x: -this.rawHandle.userOffsetX,
          y: -this.rawHandle.userOffsetY + this.hostPosition().y + this.hostSize().height / 2,
        };
      case 'right':
        return {
          x: -this.rawHandle.userOffsetX + this.parentNode.width(),
          y: -this.rawHandle.userOffsetY + this.hostPosition().y + this.hostSize().height / 2,
        };
      case 'top':
        return {
          x: -this.rawHandle.userOffsetX + this.hostPosition().x + this.hostSize().width / 2,
          y: -this.rawHandle.userOffsetY,
        };
      case 'bottom':
        return {
          x: -this.rawHandle.userOffsetX + this.hostPosition().x + this.hostSize().width / 2,
          y: -this.rawHandle.userOffsetY + this.parentNode.height(),
        };
    }
  });

  private sizeOffset = computed(() => {
    switch (this.rawHandle.position) {
      case 'left':
        return { x: -(this.size().width / 2), y: 0 };
      case 'right':
        return { x: this.size().width / 2, y: 0 };
      case 'top':
        return { x: 0, y: -(this.size().height / 2) };
      case 'bottom':
        return { x: 0, y: this.size().height / 2 };
    }
  });

  public hostReference = this.rawHandle.hostReference!;

  public template = this.rawHandle.template;

  public templateContext = {
    $implicit: {
      point: this.hostOffset,
      state: this.state,
      node: this.parentNode.rawNode,
    },
  };

  constructor(
    public rawHandle: NodeHandle,
    public parentNode: NodeModel,
    public elementCacheService: ElementCacheService,
  ) {
    if (this.hostReference instanceof HTMLElement) {
      this.elementCacheService.addElementCache({ element: this.hostReference, type: 'htmlElement' });
    } else if (this.hostReference instanceof SVGGraphicsElement) {
      this.elementCacheService.addElementCache({ element: this.hostReference, type: 'svgGraphicElement' });
    }
  }

  public onDestroy() {
    if (this.hostReference instanceof HTMLElement) {
      this.elementCacheService.removeElementCache({ element: this.hostReference, type: 'htmlElement' });
    } else if (this.hostReference instanceof SVGGraphicsElement) {
      this.elementCacheService.removeElementCache({ element: this.hostReference, type: 'svgGraphicElement' });
    }
  }

  public updateHost() {
    this.elementCacheService.markCacheAsDirty();
    this.updateHostSizeAndPosition$.next();
  }

  private getHostSize(): { width: number; height: number } {
    //TODO only get the hist ref width once ?
    if (this.hostReference instanceof HTMLElement) {
      const offsets = this.elementCacheService.getElementData({ element: this.hostReference, type: 'htmlElement' });

      if (offsets) {
        return {
          width: offsets.offsetWidth,
          height: offsets.offsetHeight,
        };
      }
    } else if (this.hostReference instanceof SVGGraphicsElement) {
      let rect = this.elementCacheService.getElementData({
        element: this.hostReference,
        type: 'svgGraphicElement',
      })?.rect;
      if (rect === undefined) {
        //We should never get here
        rect = this.hostReference.getBBox();
      }

      return rect;
    }

    return { width: 0, height: 0 };
  }
}
