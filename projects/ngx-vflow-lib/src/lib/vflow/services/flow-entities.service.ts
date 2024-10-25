import { Injectable, Signal, WritableSignal, computed, effect, signal, untracked } from '@angular/core';
import { NodeModel } from '../models/node.model';
import { EdgeModel } from '../models/edge.model';
import { ConnectionModel } from '../models/connection.model';
import { Marker } from '../interfaces/marker.interface';
import { hashCode } from '../utils/hash';
import { FlowEntity } from '../interfaces/flow-entity.interface';
import { MinimapModel } from '../models/minimap.model';

@Injectable()
export class FlowEntitiesService {
  public readonly nodes = signal<NodeModel[]>([], {
    // empty arrays considered equal, other arrays may not be equal
    equal: (a, b) => !a.length && !b.length ? true : a === b
  })

  public readonly edges = signal<EdgeModel[]>([], {
    // empty arrays considered equal, other arrays may not be equal
    equal: (a, b) => !a.length && !b.length ? true : a === b
  })

  public readonly validEdges = computed(() => {
    const nodes = this.nodes()

    return this.edges().filter(e => nodes.includes(e.source()!) && nodes.includes(e.target()!))
  })

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

    const connectionMarker = this.connection().settings.marker
    if (connectionMarker) {
      const hash = hashCode(JSON.stringify(connectionMarker))
      markersMap.set(hash, connectionMarker)
    }

    return markersMap
  })

  public entities: Signal<FlowEntity[]> = computed(() => [
    ...this.nodes(),
    ...this.edges()
  ])

  public minimap: WritableSignal<MinimapModel | null> = signal(null)

  public getNode<T>(id: string) {
    return this.nodes().find(({ node }) => node.id === id) as NodeModel<T> | undefined
  }

  public getDetachedEdges() {
    return this.edges().filter(e => e.detached())
  }
}
