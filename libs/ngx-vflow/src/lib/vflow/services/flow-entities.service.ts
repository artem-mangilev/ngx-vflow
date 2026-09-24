import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';
import { NodeModel } from '../models/node.model';
import { EdgeModel } from '../models/edge.model';
import { ConnectionModel } from '../models/connection.model';
import { Marker, MarkerRef } from '../interfaces/marker.interface';
import { markerId, normalizeMarker } from '../utils/marker-ref';
import { MarkerShapes } from '../utils/marker-inset';
import { FlowEntity } from '../interfaces/flow-entity.interface';
import { MinimapModel } from '../models/minimap.model';
import { Node } from '../interfaces/node.interface';

@Injectable()
export class FlowEntitiesService {
  public readonly nodes = signal<NodeModel[]>([], {
    // empty arrays considered equal, other arrays may not be equal
    equal: (a, b) => (!a.length && !b.length ? true : a === b),
  });

  public readonly nodeByIdMap = computed(() => {
    const result = new Map<string, NodeModel>();
    this.nodes().forEach((x) => {
      result.set(x.rawNode.id, x);
    });
    return result;
  });

  public readonly nodesByParentIdMap = computed(() => {
    const result = new Map<string, NodeModel[]>();
    this.nodes().forEach((x) => {
      if (!x.rawNode.parentId) return;
      const parentId = x.rawNode.parentId();
      if (!parentId) return;

      const nodes = result.get(parentId);
      if (nodes) {
        nodes.push(x);
        result.set(parentId, nodes);
      } else {
        result.set(parentId, [x]);
      }
    });
    return result;
  });

  public readonly rawNodes = computed(() => this.nodes().map((n) => n.rawNode) as Node[]);

  public readonly edges = signal<EdgeModel[]>([], {
    // empty arrays considered equal, other arrays may not be equal
    equal: (a, b) => (!a.length && !b.length ? true : a === b),
  });

  public readonly rawEdges = computed(() => this.edges().map((e) => e.edge));

  public readonly validEdges = computed(() => {
    const nodes = new Set(this.nodes());

    return this.edges().filter((e) => nodes.has(e.source()!) && nodes.has(e.target()!));
  });

  public readonly connection = signal<ConnectionModel>(new ConnectionModel({}));

  /** Marker shapes declared with `ng-template[marker]`, by type; set by the flow component. */
  public readonly markerShapes = signal<MarkerShapes>(new Map());

  /** Distinct markers of the edges and the connection line, by the id of their shared `<marker>` element. */
  public readonly markers = computed(() => {
    const markersMap = new Map<number, Marker>();
    const add = (marker: MarkerRef | undefined) => {
      if (marker) {
        markersMap.set(markerId(marker), normalizeMarker(marker));
      }
    };

    this.validEdges().forEach((e) => {
      const markers = e.markers();
      add(markers?.start);
      add(markers?.end);
    });

    add(this.connection().settings.marker);

    return markersMap;
  });

  public entities: Signal<FlowEntity[]> = computed(() => [...this.nodes(), ...this.edges()]);

  public minimap: WritableSignal<MinimapModel | null> = signal(null);

  public getNode<T>(id: string) {
    return this.nodeByIdMap().get(id) as NodeModel<T> | undefined;
  }

  public getDetachedEdges() {
    return this.edges().filter((e) => e.detached());
  }
}
