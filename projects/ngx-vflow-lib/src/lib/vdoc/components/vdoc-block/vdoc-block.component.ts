import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, OnInit, inject } from '@angular/core';
import { BlockStyleSheet } from '../../interfaces/stylesheet.interface';
import { TreeManagerService } from '../../services/tree-manager.service';

@Component({
  selector: '[vdoc-block]',
  template: `
    <svg:rect
      [attr.width]="width"
      [attr.height]="height"
      [attr.x]="x"
      [attr.y]="y"
      [attr.rx]="radiusX"
      [attr.fill]="fillColor"
    ></svg:rect>
    <ng-content></ng-content>
  `,
  styleUrls: ['./vdoc-block.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VDocBlockComponent implements OnInit {
  @Input()
  public styleSheet!: BlockStyleSheet

  @HostBinding('attr.width')
  protected hostWidth = 0

  @HostBinding('attr.height')
  protected hostHeight = 0

  @HostBinding('attr.x')
  protected hostX = 0

  @HostBinding('attr.y')
  protected hostY = 0

  protected width = 0
  protected height = 0
  protected x = 0
  protected y = 0
  protected radiusX = 0
  protected fillColor = ''

  protected marginBottom = 0

  private get host() {
    return this.hostRef.nativeElement
  }

  private hostRef: ElementRef<SVGGElement> = inject(ElementRef)
  private treeManager: TreeManagerService = inject(TreeManagerService)

  ngOnInit(): void {
    this.hostWidth = this.styleSheet.width
    this.width = this.styleSheet.width

    this.hostHeight = this.styleSheet.height
    this.height = this.styleSheet.height

    this.hostY = this.getElementY();

    this.marginBottom = this.styleSheet.marginBottom

    this.fillColor = this.styleSheet.backgroundColor

    this.radiusX = this.styleSheet.borderRadius

    this.treeManager.register(this.host, this)
  }

  private getElementY() {
    const prevSibling = this.host.previousSibling as Element | null;

    if (this.treeManager.has(prevSibling)) {
      const prevComponent = this.treeManager.get(prevSibling)!;

      return (
        prevComponent.y + prevComponent.height + prevComponent.marginBottom
      );
    }

    return 0;
  }
}
