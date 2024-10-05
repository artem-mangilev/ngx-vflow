import { Directive, Input, OnInit } from "@angular/core"
import { ComponentNode } from '../../interfaces/node.interface';
import { CustomNodeBaseComponent } from "../../components/custom-node-base/custom-node-base.component";

@Directive()
export abstract class CustomNodeComponent<T = unknown> extends CustomNodeBaseComponent<T> implements OnInit {
  /**
   * Reference to node bound to this component
   */
  @Input()
  public override node!: ComponentNode<T>

  public override ngOnInit(): void {
    if (this.node.data) {
      this.data.set(this.node.data)
    }

    super.ngOnInit()
  }
}

