import { Injectable, computed, effect, signal, untracked } from '@angular/core';
import { NodeModel } from '../models/node.model';
import { EdgeModel } from '../models/edge.model';
import { ConnectionModel } from '../models/connection.model';
import { Marker } from '../interfaces/marker.interface';
import { hashCode } from '../../shared/utils/hash';

@Injectable()
export class FlowEntitiesService {
  public readonly nodes = signal<NodeModel[]>([])

  public readonly edges = signal<EdgeModel[]>([])

  public readonly connection = signal<ConnectionModel>(new ConnectionModel({}))

  public readonly markers = computed(() => {
    const markersMap = new Map<number, Marker>()

    this.validEdges().forEach(e => {
      if (e.edge.markers?.start) {
        const hash = hashCode(JSON.stringify(e.edge.markers.start))
        markersMap.set(hash, e.edge.markers.start)
      }

      if (e.edge.markers?.end) {
        const hash = hashCode(JSON.stringify(e.edge.markers.end))
        markersMap.set(hash, e.edge.markers.end)
      }
    })

    const connectionMarker = this.connection().connection.marker
    if (connectionMarker) {
      const hash = hashCode(JSON.stringify(connectionMarker))
      markersMap.set(hash, connectionMarker)
    }

    return markersMap
  })

  public readonly validEdges = computed(() => {
    const nodes = this.nodes()

    return this.edges().filter(e => nodes.includes(e.source) && nodes.includes(e.target))
  })

  // TODO see if I could infer invalid edges from valid
  public readonly detachedEdges = computed(() => {
    const nodes = this.nodes()

    return untracked(this.edges).filter(({ source, target }) =>
      !nodes.includes(source) || !nodes.includes(target)
    )
  })

  public getNode<T>(id: string) {
    return this.nodes().find(({ node }) => node.id === id) as NodeModel<T> | undefined
  }
}
