import {
  ChangeDetectorRef,
  DestroyRef,
  Directive,
  DoCheck,
  EmbeddedViewRef,
  inject,
  Input,
  IterableChangeRecord,
  IterableChanges,
  IterableDiffer,
  IterableDiffers,
  NgIterable,
  TemplateRef,
  TrackByFunction,
  ViewContainerRef,
  ViewRef,
  isDevMode,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Subject,
  animationFrames,
  bufferCount,
  concatMap,
  delayWhen,
  finalize,
  from,
  of,
  take,
  takeUntil,
  tap,
} from 'rxjs';

/** Enum with lazy render directive state */
enum LazyForState {
  /** Directive is in idle state */
  idle = 'idle',
  /** Directive is rendering */
  rendering = 'rendering',
}

/**
 * Context for an element in lazyFor
 */
class LazyForContextModel<T, U extends NgIterable<T> = NgIterable<T>> {
  /** Whether the element is first */
  public get first(): boolean {
    return this.index === 0;
  }

  /** Whether the element is last */
  public get last(): boolean {
    return this.index === this.count - 1;
  }

  /** Whether the element is even */
  public get even(): boolean {
    return this.index % 2 === 0;
  }

  /** Whether the element is odd */
  public get odd(): boolean {
    return !this.even;
  }

  constructor(
    public $implicit: T,
    public lazyFor: U,
    public index: number,
    public count: number,
  ) {}
}

type LazyForItem<T> = {
  item: IterableChangeRecord<T>;
  adjustedPreviousIndex: number | null;
  currentIndex: number | null;
};

@Directive({
  selector: '[lazyFor][lazyForOf]',
  standalone: true,
})
export class LazyForDirective<T, U extends NgIterable<T> = NgIterable<T>> implements DoCheck {
  private _template = inject<TemplateRef<LazyForContextModel<T, U>>>(TemplateRef);
  private _viewContainer = inject(ViewContainerRef);
  private _differs = inject(IterableDiffers);
  private _cdr = inject(ChangeDetectorRef);
  private _destroyRef$ = inject(DestroyRef);

  /**
   * Asserts the correct type of the context for the template that `lazyFor` will render.
   *
   * The presence of this method is a signal to the Ivy template type-check compiler that the
   * `lazyFor` structural directive renders its template with a specific context type.
   */
  public static ngTemplateContextGuard<T, U extends NgIterable<T>>(
    dir: LazyForDirective<T, U>,
    ctx: any,
  ): ctx is LazyForContextModel<T, U> {
    return true;
  }

  //#region INPUTS
  /** Setter for the array to be rendered by the directive */
  @Input()
  public set lazyForOf(lazyFor: (U & NgIterable<T>) | undefined | null) {
    this._lazyFor = lazyFor;
    this._lazyForDirty = true;
  }

  /**
   * Input - setter for TrackBy function
   * @description is required
   */
  @Input({ required: true })
  public set lazyForTrackBy(fn: TrackByFunction<T>) {
    if (isDevMode() && fn !== null && typeof fn !== 'function') {
      console.warn(
        `trackBy must be a function, but received ${JSON.stringify(fn)}. ` +
          `See https://angular.io/api/common/NgForOf#change-propagation for more information.`,
      );
    }
    this._trackByFn = fn;
  }

  /**
   * Setter for the number of items that will be rendered per frame
   * @param value number of items that will be rendered per frame
   */
  @Input()
  public set lazyForItemsPerFrame(value: number) {
    if (value <= 0) {
      if (isDevMode()) {
        console.warn('Items per frame parameter cannot be lower than 0! Input value was ignored');
      }

      return;
    }

    this._itemsPerFrame = value;
  }

  /** Setter for array item template */
  @Input()
  public set lazyForTemplate(value: TemplateRef<LazyForContextModel<T, U>>) {
    if (value) {
      this._template = value;
    }
  }

  /** Getter for TrackBy function */
  public get lazyForTrackBy(): TrackByFunction<T> {
    return this._trackByFn;
  }

  //#region PROPERTIES
  /** Array for rendering */
  private _lazyFor: U | undefined | null = null;
  /** lazyFor initialization flag */
  private _lazyForDirty: boolean = true;
  /** Differ for tracking changes in input array */
  private _differ: IterableDiffer<T> | null = null;
  /** trackBy function */
  private _trackByFn!: TrackByFunction<T>;
  /** Number of items to be rendered per frame */
  private _itemsPerFrame: number = 5;
  /** Directive state */
  private _lazyForState: LazyForState = LazyForState.idle;
  //#endregion

  //#region RXJS
  /** Private subject for stopping dynamic render process */
  private readonly _rerenderUnsub$: Subject<void> = new Subject<void>();
  //#endregion

  constructor() {
    this._destroyRef$.onDestroy(() => this._viewContainer.clear());
  }

  /** ngDoCheck hook */
  public ngDoCheck(): void {
    if (this._lazyForDirty) {
      this._lazyForDirty = false;
      const value: U | undefined | null = this._lazyFor;
      if (!this._differ && value) {
        this._differ = this._differs.find(value).create(this.lazyForTrackBy);
      }
    }

    if (this._differ) {
      let changes: IterableChanges<T> | null = this._differ.diff(this._lazyFor);
      if (changes) {
        if (this._lazyForState === LazyForState.rendering) {
          /**
           * If the array changed during an active render process
           * Need to clear container of all views
           * And restart rendering from the beginning.
           */
          this._rerenderUnsub$.next();
          changes = this._differ.diff([]);
          changes = this._differ.diff(this._lazyFor);
          this._viewContainer.clear();
          if (changes) {
            this.applyChanges(changes);
          }
        } else {
          this.applyChanges(changes);
        }
      }
    }
  }

  /**
   * Apply changes detected by differ
   * @param changes changes
   */
  private applyChanges(changes: IterableChanges<T>): void {
    const itemDataListToRender: Array<LazyForItem<T>> = [];
    changes.forEachOperation(
      (item: IterableChangeRecord<T>, adjustedPreviousIndex: number | null, currentIndex: number | null) => {
        const itemToPush: LazyForItem<T> = {
          item: { ...item },
          adjustedPreviousIndex,
          currentIndex,
        };
        itemDataListToRender.push(itemToPush);
      },
    );

    this.performLazyRender(itemDataListToRender, changes);
  }

  /**
   * Perform lazy rendering
   * @param itemDataListToRender list of items to render
   * @param changes changes
   */
  private performLazyRender(itemDataListToRender: Array<LazyForItem<T>>, changes: IterableChanges<T>): void {
    this.updateLazyForState(LazyForState.rendering);
    this._rerenderUnsub$.next();

    from(itemDataListToRender)
      .pipe(
        bufferCount(this._itemsPerFrame),
        concatMap((itemList) => of(itemList).pipe(delayWhen(() => animationFrames()))),
        tap((itemList: Array<LazyForItem<T>>) => {
          itemList.forEach((data: LazyForItem<T>) => {
            if (data.item.previousIndex === null) {
              this._viewContainer.createEmbeddedView(
                this._template,
                new LazyForContextModel<T, U>(data.item.item, this._lazyFor!, -1, -1),
                data.currentIndex === null ? undefined : data.currentIndex,
              );
            } else if (data.currentIndex === null) {
              this._viewContainer.remove(data.adjustedPreviousIndex === null ? undefined : data.adjustedPreviousIndex);
            } else if (data.adjustedPreviousIndex !== null) {
              const view: ViewRef | null = this._viewContainer.get(data.adjustedPreviousIndex)!;
              this._viewContainer.move(view, data.currentIndex);
              this.applyViewChange(view as EmbeddedViewRef<LazyForContextModel<T, U>>, data.item);
            }
          });

          this.updateViewContext();

          this._cdr.markForCheck();
        }),
        /** Using take we automatically unsubscribe from the stream when rendering is complete */
        take(Math.ceil(itemDataListToRender.length / this._itemsPerFrame)),
        takeUntil(this._rerenderUnsub$),
        takeUntilDestroyed(this._destroyRef$),
        finalize(() => {
          changes.forEachIdentityChange((record: any) => {
            const viewRef: EmbeddedViewRef<LazyForContextModel<T, U>> = <EmbeddedViewRef<LazyForContextModel<T, U>>>(
              this._viewContainer.get(record.currentIndex)
            );
            this.applyViewChange(viewRef, record);
          });
          this.updateLazyForState(LazyForState.idle);
        }),
      )
      .subscribe();
  }

  /** Update context (without implicit$) for elements inside view */
  private updateViewContext(): void {
    for (let i: number = 0, ilen: number = this._viewContainer.length; i < ilen; i++) {
      const viewRef: EmbeddedViewRef<LazyForContextModel<T, U>> = <EmbeddedViewRef<LazyForContextModel<T, U>>>(
        this._viewContainer.get(i)
      );
      const context: LazyForContextModel<T, U> = viewRef.context;
      context.index = i;
      context.count = ilen;
      context.lazyFor = this._lazyFor!;
    }
  }

  /**
   * Apply implicit$ context
   * @param view view
   * @param record data
   */
  private applyViewChange(view: EmbeddedViewRef<LazyForContextModel<T>>, record: IterableChangeRecord<T>): void {
    view.context.$implicit = record.item;
  }

  /**
   * Update directive state
   * @param stateToSet state to set
   */
  private updateLazyForState(stateToSet: LazyForState): void {
    this._lazyForState = stateToSet;
  }
}
