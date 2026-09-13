import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  output,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { VflowComponent } from '../components/vflow/vflow.component';
import { AnyComponentNodeEvent } from '../interfaces/component-node-event.interface';
import { Node, createNode } from '../interfaces/node.interface';
import { injectNode } from '../utils/inject-node';
import { NodeTemplateDirective } from './template.directive';

@Component({
  selector: 'emitter-node',
  template: `<div class="emitter" style="width: 80px; height: 40px">{{ ctx.node.id }}:{{ ctx.data().label }}</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class EmitterNodeComponent {
  readonly ctx = injectNode<{ label: string }>();

  // eslint-disable-next-line @angular-eslint/prefer-output-emitter-ref -- decorator outputs stay supported.
  @Output() readonly legacy = new EventEmitter<string>();
  readonly modern = output<number>();
  private readonly stream = new Subject<boolean>();
  readonly streamed = outputFromObservable(this.stream);
  // eslint-disable-next-line @angular-eslint/no-output-rename -- verifies that events use the property name.
  readonly aliased = output<string>({ alias: 'renamed' });

  emitAll() {
    this.legacy.emit('a');
    this.modern.emit(1);
    this.stream.next(true);
    this.aliased.emit('b');
  }
}

@Component({
  selector: 'template-child',
  template: `<span class="template-child">{{ ctx.node.id }}</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TemplateChildComponent {
  readonly ctx = injectNode();
}

@Component({
  template: `<vflow [view]="[400, 300]" [nodes]="nodes()" (componentNodeEvent)="events.push($event)">
    <ng-template node><template-child /></ng-template>
  </vflow>`,
  imports: [VflowComponent, NodeTemplateDirective, TemplateChildComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  events: AnyComponentNodeEvent[] = [];
  nodes = signal<Node[]>([
    createNode({ id: 'emitter', component: EmitterNodeComponent, point: { x: 0, y: 0 }, data: { label: 'one' } }),
    createNode({
      id: 'lazy',
      component: () => Promise.resolve(EmitterNodeComponent),
      point: { x: 150, y: 0 },
      data: { label: 'two' },
    }),
    createNode({ id: 'plain', point: { x: 0, y: 100 } }),
  ]);
}

@Component({
  template: `<vflow [view]="[400, 300]" [nodes]="nodes" [optimization]="{ lazyLoadTrigger: 'viewport' }" />`,
  imports: [VflowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ViewportTriggerHostComponent {
  nodes: Node[] = [
    createNode({
      id: 'near',
      component: () => Promise.resolve(EmitterNodeComponent),
      point: { x: 10, y: 10 },
      width: 80,
      height: 40,
      data: { label: 'near' },
    }),
    createNode({
      id: 'far',
      component: () => Promise.resolve(EmitterNodeComponent),
      point: { x: 5000, y: 5000 },
      width: 80,
      height: 40,
      data: { label: 'far' },
    }),
  ];
}

describe('EntityComponentOutletDirective', () => {
  let fixture: ComponentFixture<HostComponent>;

  async function settle() {
    fixture.detectChanges();
    for (let i = 0; i < 5; i++) await new Promise(requestAnimationFrame);
    await fixture.whenStable();
  }

  function emitter(id: string): EmitterNodeComponent {
    return fixture.debugElement
      .queryAll(By.directive(EmitterNodeComponent))
      .map((debug) => debug.componentInstance as EmitterNodeComponent)
      .find((instance) => instance.ctx.node.id === id)!;
  }

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    fixture = TestBed.createComponent(HostComponent);
    await settle();
  });

  it('renders component classes and lazy factories without a base class and gives them the node context', () => {
    const texts = Array.from(fixture.nativeElement.querySelectorAll('.emitter')).map((el) =>
      (el as HTMLElement).textContent?.trim(),
    );
    expect(texts).toEqual(['emitter:one', 'lazy:two']);
  });

  it('gives components inside a template presentation the same node context', () => {
    expect(fixture.nativeElement.querySelector('.template-child')?.textContent).toBe('plain');
  });

  it('forwards every declared output under its property name with the node id', () => {
    emitter('emitter').emitAll();
    emitter('lazy').emitAll();

    expect(fixture.componentInstance.events).toEqual([
      { nodeId: 'emitter', eventName: 'legacy', eventPayload: 'a' },
      { nodeId: 'emitter', eventName: 'modern', eventPayload: 1 },
      { nodeId: 'emitter', eventName: 'streamed', eventPayload: true },
      { nodeId: 'emitter', eventName: 'aliased', eventPayload: 'b' },
      { nodeId: 'lazy', eventName: 'legacy', eventPayload: 'a' },
      { nodeId: 'lazy', eventName: 'modern', eventPayload: 1 },
      { nodeId: 'lazy', eventName: 'streamed', eventPayload: true },
      { nodeId: 'lazy', eventName: 'aliased', eventPayload: 'b' },
    ]);
  });

  it('stops forwarding outputs once the node is removed', async () => {
    const removed = emitter('emitter');
    fixture.componentInstance.nodes.update((nodes) => nodes.filter((node) => node.id !== 'emitter'));
    await settle();

    removed.legacy.emit('late');

    expect(fixture.nativeElement.querySelectorAll('.emitter').length).toBe(1);
    expect(fixture.componentInstance.events).toEqual([]);
  });

  it('resolves a lazy factory once its node reaches the viewport with the viewport trigger', async () => {
    const viewportFixture = TestBed.createComponent(ViewportTriggerHostComponent);
    viewportFixture.detectChanges();
    for (let i = 0; i < 5; i++) await new Promise(requestAnimationFrame);
    await viewportFixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    viewportFixture.detectChanges();
    await viewportFixture.whenStable();

    const texts = Array.from(viewportFixture.nativeElement.querySelectorAll('.emitter')).map((el) =>
      (el as HTMLElement).textContent?.trim(),
    );
    expect(texts).toEqual(['near:near']);
  });
});
