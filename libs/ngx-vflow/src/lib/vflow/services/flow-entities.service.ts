import { Injectable, Signal, computed, signal } from '@angular/core';
import { NodeModel } from '../models/node.model';
import { EdgeModel } from '../models/edge.model';
import { ConnectionModel } from '../models/connection.model';
import { Marker, MarkerRef } from '../interfaces/marker.interface';
import { markerId, normalizeMarker } from '../utils/marker-ref';
import { MarkerShapes } from '../utils/marker-inset';
import { FlowEntity } from '../interfaces/flow-entity.interface';
import { ConnectionSettings } from '../interfaces/connection-settings.interface';
import { bindableSignal } from '../utils/signals/bindable-signal';

@Injectable()
export class FlowEntitiesService {
  public readonly nodes = signal<NodeModel[]>([], {
    // empty arrays considered equal, other arrays may not be equal
    equal: (a, b) => (!a.length && !b.length ? true : a === b),
  });

  public readonly nodeByIdMap: Signal<ReadonlyMap<string, NodeModel>> = computed(() => {
    const result = new Map<string, NodeModel>();
    this.nodes().forEach((x) => {
      result.set(x.rawNode.id, x);
    });
    return result;
  });

  public readonly nodesByParentIdMap: Signal<ReadonlyMap<string, readonly NodeModel[]>> = computed(() => {
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

  public readonly rawNodes = computed(() => this.nodes().map((n) => n.rawNode));

  public readonly edges = signal<EdgeModel[]>([], {
    // empty arrays considered equal, other arrays may not be equal
    equal: (a, b) => (!a.length && !b.length ? true : a === b),
  });

  public readonly rawEdges = computed(() => this.edges().map((e) => e.edge));

  public readonly validEdges = computed(() => {
    const nodes = new Set(this.nodes());

    return this.edges().filter((e) => hasEndpoints(e, nodes));
  });

  /** @see {VflowComponent.connection} */
  public readonly connectionSettings = bindableSignal<ConnectionSettings>({});

  public readonly connection = computed(() => new ConnectionModel(this.connectionSettings()));

  /** Marker shapes declared with `ng-template[vMarker]`, by type; set by the flow component. */
  public readonly markerShapes = signal<MarkerShapes>(new Map());

  /** Distinct markers of the edges and the connection line, by the id of their shared `<marker>` element. */
  public readonly markers: Signal<ReadonlyMap<number, Marker>> = computed(() => {
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

    add(this.connection().settings.markerEnd);

    return markersMap;
  });

  public readonly entities: Signal<readonly FlowEntity[]> = computed(() => [...this.nodes(), ...this.edges()]);

  public getNode(id: string): NodeModel | undefined {
    return this.nodeByIdMap().get(id);
  }

  public getDetachedEdges(): EdgeModel[] {
    return this.edges().filter((e) => e.detached());
  }
}

/** Whether both endpoint nodes of the edge are among `nodes`. */
export function hasEndpoints(edge: EdgeModel, nodes: ReadonlySet<NodeModel>): boolean {
  const source = edge.source();
  const target = edge.target();
  return source !== null && target !== null && nodes.has(source) && nodes.has(target);
}
