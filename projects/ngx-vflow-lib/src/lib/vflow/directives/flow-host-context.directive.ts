import { Directive, ElementRef, OnInit, inject } from '@angular/core';
import { FlowCoordinateMapperService } from '../services/flow-coordinate-mapper.service';

@Directive({
  standalone: true,
  selector: '[flowHostContext]',
})
export class FlowHostContextDirective implements OnInit {
  private element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private coordinateMapper = inject(FlowCoordinateMapperService);

  public ngOnInit(): void {
    this.coordinateMapper.registerHostElement(this.element);
  }
}
