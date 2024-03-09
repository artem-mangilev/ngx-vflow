import { VflowComponent } from "../components/vflow/vflow.component";
import { Edge } from "../interfaces/edge.interface";

export function edgesAction(list: Edge[], flow?: VflowComponent) {
  return {
    add: (...newEdges: Edge[]) => {
      if (flow) {
        return [
          // filter out detached edges
          ...list.filter(e => !flow.detachedEdges().includes(e)),
          ...newEdges
        ]
      }

      return [...list, ...newEdges]
    },

    remove: (...ids: string[]) => {
      if (flow) {
        return list
          // filter out detached edges
          .filter(e => !flow.detachedEdges().includes(e))
          .filter(e => !ids.includes(e.id))
      }

      return list.filter((edge) => !ids.includes(edge.id))
    }
  }
}
