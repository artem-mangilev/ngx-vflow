import { Node } from "../interfaces/node.interface";

export function nodesAction(list: Node[]) {
  return {
    add: (...newNodes: Node[]) => [...list, ...newNodes],

    remove: (...ids: string[]) => list.filter((node) => !ids.includes(node.id)),
  }
}
