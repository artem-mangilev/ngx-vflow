import { Directive, Input, signal } from "@angular/core"
import { ComponentNode, SharedNode } from '../interfaces/node.interface';

@Directive()
export abstract class CustomNodeComponent<T = unknown> {
  @Input()
  node!: SharedNode & ComponentNode<T>

  @Input()
  set _selected(value: boolean) {
    this.selected.set(value)
  }

  public selected = signal(false)
}
