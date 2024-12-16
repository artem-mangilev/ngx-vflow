import { Directive, input, Input, OnInit } from "@angular/core"
import { ComponentDynamicNode } from '../../interfaces/node.interface';
import { CustomNodeBaseComponent } from "../../components/custom-node-base/custom-node-base.component";

@Directive()
export abstract class CustomDynamicNodeComponent<T = any> extends CustomNodeBaseComponent<T> implements OnInit {
  /**
   * Reference to node bound to this component
   */
  public node = input.required<ComponentDynamicNode<T>>()

  public override ngOnInit(): void {
    const data = this.node().data

    if (data) {
      this.data = data
    }

    super.ngOnInit()
  }
}

