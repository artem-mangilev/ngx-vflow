import { Directive, EventEmitter, OnInit, inject, OutputEmitterRef, input, linkedSignal } from '@angular/core';
import { merge, Observable, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ComponentEventBusService } from '../../services/component-event-bus.service';
import { NodeAccessorService } from '../../services/node-accessor.service';
import { ComponentNode } from '../../interfaces/node.interface';

@Directive()
export abstract class CustomNodeComponent<T = any> implements OnInit {
  private eventBus = inject(ComponentEventBusService);
  private nodeService = inject(NodeAccessorService);

  /**
   * Reference to node bound to this component
   */
  public node = input.required<ComponentNode<T>>();

  /**
   * Signal with selected state of node
   */
  public selected = this.nodeService.model()!.selected;

  /**
   * Signal with data of node
   *
   * TODO: decide whether to make it a computed or keep as linked signal
   * For now, keeping it as linked signal for backward compatibility
   * because previous impementation exposed it as a WritableSignal
   * and allowed mutation of the data in node.
   * This implementation does not allow to change node data.
   *
   */
  public data = linkedSignal(() => this.node().data?.());

  constructor() {
    // assume that after node input is set, all event emitters and output refs are also set
    toObservable(this.node)
      .pipe(
        switchMap(() => this.trackEvents()),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  // TODO: no longer needed, remove in next major
  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {}

  private trackEvents() {
    const props = Object.getOwnPropertyNames(this);

    const emittersOrRefs = new Map<Observable<unknown>, string>();
    for (const prop of props) {
      const field = (this as Record<string, unknown>)[prop];

      if (field instanceof EventEmitter) {
        emittersOrRefs.set(field, prop);
      }

      if (field instanceof OutputEmitterRef) {
        emittersOrRefs.set(outputRefToObservable(field), prop);
      }
    }

    return merge(
      ...Array.from(emittersOrRefs.keys()).map((emitter) =>
        emitter.pipe(
          tap((event) => {
            this.eventBus.pushEvent({
              nodeId: this.nodeService.model()?.rawNode.id ?? '',
              eventName: emittersOrRefs.get(emitter)!,
              eventPayload: event,
            });
          }),
        ),
      ),
    );
  }
}

function outputRefToObservable(ref: OutputEmitterRef<unknown>) {
  return new Observable((subscriber) => {
    const subscription = ref.subscribe((value) => {
      subscriber.next(value);
    });

    return () => {
      subscription.unsubscribe();
    };
  });
}
