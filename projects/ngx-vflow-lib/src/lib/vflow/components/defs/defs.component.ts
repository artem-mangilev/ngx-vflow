import { ChangeDetectionStrategy, Component, HostBinding, Input, OnInit } from '@angular/core';
import { Marker } from '../../interfaces/marker.interface';

@Component({
  selector: 'defs[flowDefs]',
  template: `
    <svg:marker
      *ngFor="let marker of markers | keyvalue"
      [attr.id]="marker.key"
      [attr.markerWidth]="marker.value.width ?? 12.5"
      [attr.markerHeight]="marker.value.height ?? 12.5"
      viewBox="-10 -10 20 20"
      markerUnits="strokeWidth"
      refX="0"
      refY="0"
      orient="auto-start-reverse"
    >
      <polyline
        [style.stroke]="marker.value.color ?? 'rgb(177, 177, 183)'"
        [style.fill]="marker.value.color ?? 'rgb(177, 177, 183)'"
        style="stroke-width: 1;"
        stroke-linecap="round"
        stroke-linejoin="round"
        points="-5,-4 1,0 -5,4 -5,-4"
      />
    </svg:marker>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefsComponent {
  @Input({ required: true })
  public markers: Map<number, Marker> = new Map()
}
