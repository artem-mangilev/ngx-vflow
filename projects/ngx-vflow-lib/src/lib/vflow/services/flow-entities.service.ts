import { Injectable, computed, signal } from '@angular/core';
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

    this.edges().forEach(e => {
      if (e.edge.markers?.start) {
        const hash = hashCode(JSON.stringify(e.edge.markers.start))
        markersMap.set(hash, e.edge.markers.start)
      }

      if (e.edge.markers?.end) {
        const hash = hashCode(JSON.stringify(e.edge.markers.end))
        markersMap.set(hash, e.edge.markers.end)
      }
    })

    return markersMap
  })

  public getNode<T>(id: string) {
    return this.nodes().find(({ node }) => node.id === id) as NodeModel<T> | undefined
  }
}
