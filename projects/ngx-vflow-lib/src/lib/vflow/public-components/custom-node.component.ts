import { DestroyRef, Directive, EventEmitter, Input, OnInit, inject, signal } from "@angular/core"
import { ComponentNode } from '../interfaces/node.interface';
import { ComponentEventBusService } from "../services/component-event-bus.service";
import { merge, tap } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Directive()
export abstract class CustomNodeComponent<T = unknown> implements OnInit {
  private eventBus = inject(ComponentEventBusService)

  protected destroyRef = inject(DestroyRef)

  /**
   * Reference to node bound to this component
   */
  @Input()
  public node!: ComponentNode<T>

  @Input()
  public set _selected(value: boolean) {
    this.selected.set(value)
  }

  /**
   * Signal with selected state of node
   */
  public selected = signal(false)

  public ngOnInit(): void {
    this.trackEvents()
  }

  private trackEvents() {
    const props = Object.getOwnPropertyNames(this)

    const emitters = new Map<EventEmitter<unknown>, string>()
    for (const prop of props) {
      const field = (this as Record<string, unknown>)[prop]

      if (field instanceof EventEmitter) {
        emitters.set(field, prop)
      }
    }

    merge(
      ...Array.from(emitters.keys()).map(emitter =>
        emitter.pipe(
          tap((event) => {
            this.eventBus.pushEvent({
              nodeId: this.node.id,
              eventName: emitters.get(emitter)!,
              eventPayload: event
            })
          }))
      )
    )
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe()
  };
}

