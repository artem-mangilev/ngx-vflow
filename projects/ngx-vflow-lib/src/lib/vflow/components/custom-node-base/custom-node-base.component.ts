import {
  DestroyRef,
  Directive,
  EventEmitter,
  Input,
  OnInit,
  inject,
  signal,
  input,
} from '@angular/core';
import { merge, of, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ComponentEventBusService } from '../../services/component-event-bus.service';
import {
  ComponentDynamicNode,
  ComponentNode,
} from '../../interfaces/node.interface';

@Directive()
export abstract class CustomNodeBaseComponent<T = unknown> implements OnInit {
  private eventBus = inject(ComponentEventBusService);

  protected destroyRef = inject(DestroyRef);

  /**
   * Reference to node bound to this component
   */
  protected node!: ComponentNode | ComponentDynamicNode;

  /**
   * Signal with selected state of node
   */
  public selected = input(false);

  public data = signal<T | undefined>(undefined);

  public ngOnInit(): void {
    this.trackEvents().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  private trackEvents() {
    const props = Object.getOwnPropertyNames(this);

    const emitters = new Map<EventEmitter<unknown>, string>();
    for (const prop of props) {
      const field = (this as Record<string, unknown>)[prop];

      if (field instanceof EventEmitter) {
        emitters.set(field, prop);
      }
    }

    return merge(
      ...Array.from(emitters.keys()).map((emitter) =>
        emitter.pipe(
          tap((event) => {
            this.eventBus.pushEvent({
              nodeId: this.node.id,
              eventName: emitters.get(emitter)!,
              eventPayload: event,
            });
          }),
        ),
      ),
    );
  }
}
