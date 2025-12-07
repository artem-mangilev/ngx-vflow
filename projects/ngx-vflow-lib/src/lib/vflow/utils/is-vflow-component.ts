import { CustomNodeComponent } from '../public-components/custom-node/custom-node.component';

export function isCustomNodeComponent(type: any): type is CustomNodeComponent {
  return Object.prototype.isPrototypeOf.call(CustomNodeComponent, type);
}
