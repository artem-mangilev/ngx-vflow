import {
  DestroyRef,
  Directive,
  EventEmitter,
  Input,
  OnInit,
  inject,
  signal,
  input,
  OutputEmitterRef,
} from '@angular/core';
import { merge, Observable, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ComponentEventBusService } from '../../services/component-event-bus.service';
import { NodeAccessorService } from '../../services/node-accessor.service';

@Directive()
export abstract class CustomNodeBaseComponent<T = any> implements OnInit {
  private eventBus = inject(ComponentEventBusService);
  private nodeService = inject(NodeAccessorService)

  protected destroyRef = inject(DestroyRef);

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
              nodeId: this.nodeService.model()?.node.id ?? '',
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
