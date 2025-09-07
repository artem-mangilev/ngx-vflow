import { CustomDynamicNodeComponent } from '../public-components/custom-dynamic-node/custom-dynamic-node.component';
import { CustomNodeComponent } from '../public-components/custom-node/custom-node.component';

export function isCustomNodeComponent(type: any): type is CustomNodeComponent {
  return Object.prototype.isPrototypeOf.call(CustomNodeComponent, type);
}

export function isCustomDynamicNodeComponent(type: any): type is CustomDynamicNodeComponent {
  return Object.prototype.isPrototypeOf.call(CustomDynamicNodeComponent, type);
}
