import { VflowComponent } from "../components/vflow/vflow.component";
import { Edge } from "../interfaces/edge.interface";

export function edgesOperation(list: Edge[], flow?: VflowComponent) {
  const clearInvalid = () => {
    // if (flow) {
    //   console.log(flow.detachedEdges())

    //   return list.filter(e => !flow.detachedEdges().includes(e))
    // }

    return list
  }

  return {
    add: (...newEdges: Edge[]) => {
      if (flow) {
        return [
          ...clearInvalid(),
          ...newEdges
        ]
      }

      return [...list, ...newEdges]
    },

    remove: (...ids: string[]) => {
      if (flow) {
        return clearInvalid().filter(e => !ids.includes(e.id))
      }

      return list.filter((edge) => !ids.includes(edge.id))
    },

    clearInvalid
  }
}
