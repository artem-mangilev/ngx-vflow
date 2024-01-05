import { Directive, HostBinding, Input, OnInit } from "@angular/core";
import { VDocViewComponent } from "../vdoc-view/vdoc-view.component";
import { ComponentViewModel } from "../../view-models/component.view-model";
import { BlockStyleSheet } from "../../interfaces/stylesheet.interface";

@Directive()
export class VDocComponent extends VDocViewComponent<ComponentViewModel> implements OnInit {
  @Input()
  public styleSheet: BlockStyleSheet = {}

  @HostBinding('attr.width')
  protected get hostWidth() {
    return this.model.width()
  }

  @HostBinding('attr.height')
  protected get hostHeight() {
    return this.model.height()
  }

  @HostBinding('attr.x')
  protected get hostX() {
    return this.model.x()
  }

  @HostBinding('attr.y')
  protected get hostY() {
    return this.model.y()
  }

  @HostBinding('style.filter')
  protected get filterStyle() {
    return this.model.filter()
  }

  @HostBinding('style.overflow')
  protected overflow = 'visible'

  constructor() {
    super()

    if (!this.parent) {
      throw new Error(`injection error`);
    }
  }

  protected modelFactory(): ComponentViewModel {
    return new ComponentViewModel(this, this.styleSheet)
  }
}
