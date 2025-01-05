import { Directive, input, OnInit } from "@angular/core"
import { ComponentNode } from '../../interfaces/node.interface';
import { CustomNodeBaseComponent } from "../../components/custom-node-base/custom-node-base.component";

@Directive()
export abstract class CustomNodeComponent<T = any> extends CustomNodeBaseComponent<T> implements OnInit {
  /**
   * Reference to node bound to this component
   */
  public node = input.required<ComponentNode<T>>()

  public override ngOnInit(): void {
    if (this.node().data) {
      this.data.set(this.node().data)
    }

    super.ngOnInit()
  }
}

