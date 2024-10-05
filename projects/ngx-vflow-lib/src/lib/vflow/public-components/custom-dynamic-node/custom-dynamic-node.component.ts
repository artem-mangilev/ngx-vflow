import { Directive, Input, OnInit } from "@angular/core"
import { ComponentDynamicNode } from '../../interfaces/node.interface';
import { CustomNodeBaseComponent } from "../../components/custom-node-base/custom-node-base.component";

@Directive()
export abstract class CustomDynamicNodeComponent<T = unknown> extends CustomNodeBaseComponent<T> implements OnInit {
  /**
   * Reference to node bound to this component
   */
  @Input()
  public override node!: ComponentDynamicNode<T>

  public override ngOnInit(): void {
    if (this.node.data) {
      this.data = this.node.data
    }

    super.ngOnInit()
  }
}

