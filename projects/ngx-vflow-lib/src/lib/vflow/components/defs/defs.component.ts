import { ChangeDetectionStrategy, Component, HostBinding, Input, OnInit } from '@angular/core';
import { Marker } from '../../interfaces/marker.interface';

@Component({
  selector: 'defs[flowDefs]',
  template: `
    <svg:marker
      *ngFor="let marker of markers | keyvalue"
      [attr.id]="marker.key"
      markerWidth="12.5"
      markerHeight="12.5"
      viewBox="-10 -10 20 20"
      markerUnits="strokeWidth"
      refX="0"
      refY="0">
      <polyline stroke-linecap="round" stroke-linejoin="round" points="-5,-4 1,0 -5,4 -5,-4" style="stroke: rgb(177, 177, 183); fill: rgb(177, 177, 183); stroke-width: 1;"/>
    </svg:marker>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefsComponent {
  @Input({ required: true })
  public markers: Map<number, Marker> = new Map()
}
