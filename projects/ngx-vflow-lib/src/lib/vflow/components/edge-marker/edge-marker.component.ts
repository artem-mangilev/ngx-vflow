import { ChangeDetectionStrategy, Component, HostBinding, Input, OnInit } from '@angular/core';
import { Marker } from '../../interfaces/marker.interface';

@Component({
  selector: 'marker[edgeMarker]',
  template: `
    <svg:path d="M 0 0 L 10 5 L 0 10 z" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EdgeMarkerComponent {
  @Input({ required: true })
  public id!: number

  @Input({ required: true })
  public marker!: Marker

  @HostBinding('id')
  protected get markerId() {
    return this.id
  }

  @HostBinding('attr.viewBox')
  protected viewBox = '-10 -10 10 10'

  @HostBinding('attr.refX')
  protected refX = '0'

  @HostBinding('attr.refY')
  protected refY = '0'

  @HostBinding('attr.markerWidth')
  protected markerWidth = '6'

  @HostBinding('attr.markerHeight')
  protected markerHeight = '6'

}
