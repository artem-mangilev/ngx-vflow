import { Injectable, signal } from '@angular/core';
import { NodeModel } from '../models/node.model';
import { EdgeModel } from '../models/edge.model';
import { ConnectionModel } from '../models/connection.model';

@Injectable()
export class FlowEntitiesService {
  public readonly nodes = signal<NodeModel[]>([])

  public readonly edges = signal<EdgeModel[]>([])

  public readonly connection = signal<ConnectionModel>(new ConnectionModel({}))
}
