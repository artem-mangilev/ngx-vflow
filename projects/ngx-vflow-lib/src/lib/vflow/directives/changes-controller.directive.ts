import { Directive, Output, inject } from '@angular/core';
import { NodeAddChange, NodeChange, NodePositionChange, NodeRemoveChange, NodeSelectedChange, NodeSizeChange } from '../types/node-change.type';
import { EdgeChangesService } from '../services/edge-changes.service';
import { NodesChangeService } from '../services/node-changes.service';
import { Observable, filter, map } from 'rxjs';
import { EdgeAddChange, EdgeChange, EdgeDetachedChange, EdgeRemoveChange, EdgeSelectChange } from '../types/edge-change.type';

@Directive({
  selector: '[changesController]',
  standalone: true
})
export class ChangesControllerDirective {
  protected nodesChangeService = inject(NodesChangeService)
  protected edgesChangeService = inject(EdgeChangesService)

  /**
   * Watch nodes change
   */
  @Output()
  public onNodesChange = this.nodesChangeService.changes$

  @Output('onNodesChange.position')
  public onNodesChangePosition = this.nodeChangesOfType('position')

  @Output('onNodesChange.position.single')
  public onNodesChangePositionSignle = this.singleChange(
    this.nodeChangesOfType('position')
  )

  @Output('onNodesChange.position.many')
  public onNodesChangePositionMany = this.manyChanges(
    this.nodeChangesOfType('position')
  )

  @Output('onNodesChange.size')
  public onNodesChangeSize = this.nodeChangesOfType('size')

  @Output('onNodesChange.size.single')
  public onNodesChangeSizeSingle = this.singleChange(
    this.nodeChangesOfType('size')
  )

  @Output('onNodesChange.size.many')
  public onNodesChangeSizeMany = this.manyChanges(
    this.nodeChangesOfType('size')
  )

  @Output('onNodesChange.add')
  public onNodesChangeAdd = this.nodeChangesOfType('add')

  @Output('onNodesChange.add.single')
  public onNodesChangeAddSingle = this.singleChange(
    this.nodeChangesOfType('add')
  )

  @Output('onNodesChange.add.many')
  public onNodesChangeAddMany = this.manyChanges(
    this.nodeChangesOfType('add')
  )

  @Output('onNodesChange.remove')
  public onNodesChangeRemove = this.nodeChangesOfType('remove')

  @Output('onNodesChange.remove.single')
  public onNodesChangeRemoveSingle = this.singleChange(
    this.nodeChangesOfType('remove')
  )

  @Output('onNodesChange.remove.many')
  public onNodesChangeRemoveMany = this.manyChanges(
    this.nodeChangesOfType('remove')
  )

  @Output('onNodesChange.select')
  public onNodesChangeSelect = this.nodeChangesOfType('select')

  @Output('onNodesChange.select.single')
  public onNodesChangeSelectSingle = this.singleChange(
    this.nodeChangesOfType('select')
  )

  @Output('onNodesChange.select.many')
  public onNodesChangeSelectMany = this.manyChanges(
    this.nodeChangesOfType('select')
  )

  /**
   * Watch edges change
   */
  @Output()
  public onEdgesChange = this.edgesChangeService.changes$

  @Output('onEdgesChange.detached')
  public onNodesChangeDetached = this.edgeChangesOfType('detached')

  @Output('onEdgesChange.detached.single')
  public onNodesChangeDetachedSingle = this.singleChange(
    this.edgeChangesOfType('detached')
  )

  @Output('onEdgesChange.detached.many')
  public onNodesChangeDetachedMany = this.manyChanges(
    this.edgeChangesOfType('detached')
  )

  @Output('onEdgesChange.add')
  public onEdgesChangeAdd = this.edgeChangesOfType('add')

  @Output('onEdgesChange.add.single')
  public onEdgeChangeAddSingle = this.singleChange(
    this.edgeChangesOfType('add')
  )

  @Output('onEdgesChange.add.many')
  public onEdgeChangeAddMany = this.manyChanges(
    this.edgeChangesOfType('add')
  )

  @Output('onEdgesChange.remove')
  public onEdgeChangeRemove = this.edgeChangesOfType('remove')

  @Output('onEdgesChange.remove.single')
  public onEdgeChangeRemoveSingle = this.singleChange(
    this.edgeChangesOfType('remove')
  )

  @Output('onEdgesChange.remove.many')
  public onEdgeChangeRemoveMany = this.manyChanges(
    this.edgeChangesOfType('remove')
  )

  @Output('onEdgesChange.select')
  public onEdgeChangeSelect = this.edgeChangesOfType('select')

  @Output('onEdgesChange.select.single')
  public onEdgeChangeSelectSingle = this.singleChange(
    this.edgeChangesOfType('select')
  )

  @Output('onEdgesChange.select.many')
  public onEdgeChangeSelectMany = this.manyChanges(
    this.edgeChangesOfType('select')
  )

  private nodeChangesOfType<T extends NodeChange['type']>(type: T) {
    return this.nodesChangeService.changes$.pipe(
      map(changes => changes.filter((c): c is NodeChangeMap[T] => c.type === type)),
      filter(changes => !!changes.length)
    )
  }

  private edgeChangesOfType<T extends EdgeChange['type']>(type: T) {
    return this.edgesChangeService.changes$.pipe(
      map(changes => changes.filter((c): c is EdgeChangeMap[T] => c.type === type)),
      filter(changes => !!changes.length)
    )
  }

  private singleChange<T>(changes$: Observable<T[]>) {
    return changes$.pipe(
      filter(changes => changes.length === 1),
      map(([first]) => first)
    )
  }

  private manyChanges<T>(changes$: Observable<T[]>) {
    return changes$.pipe(
      filter(changes => changes.length > 1),
    )
  }
}

// TODO: do not write this types manually
type NodeChangeMap = {
  position: NodePositionChange,
  size: NodeSizeChange,
  add: NodeAddChange,
  remove: NodeRemoveChange,
  select: NodeSelectedChange
}

type EdgeChangeMap = {
  detached: EdgeDetachedChange,
  add: EdgeAddChange,
  remove: EdgeRemoveChange,
  select: EdgeSelectChange
}
