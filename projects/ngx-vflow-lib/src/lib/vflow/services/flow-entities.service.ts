import { Injectable, signal } from '@angular/core';
import { NodeModel } from '../models/node.model';
import { EdgeModel } from '../models/edge.model';
import { Edge } from '../interfaces/edge.interface';

@Injectable()
export class FlowEntitiesService {
  public readonly nodes = signal<NodeModel[]>([])

  public readonly edges = signal<EdgeModel[]>([])

  public addEdge(newEdge: EdgeModel) {
    this.edges.update((edges) => [...edges, newEdge])
  }
}
