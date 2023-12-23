import { Directive, HostBinding, Input, OnInit, Optional, SkipSelf, forwardRef, inject } from "@angular/core";
import { VDocViewComponent } from "../vdoc-view/vdoc-view.component";
import { AnyViewModel } from "../../view-models/any.view-model";
import { ComponentViewModel } from "../../view-models/component.view-model";
import { BlockStyleSheet } from "../../interfaces/stylesheet.interface";

@Directive()
export class VDocComponent extends VDocViewComponent implements OnInit {
  @Input()
  public styleSheet: BlockStyleSheet = {}

  @HostBinding('attr.width')
  protected get hostWidth() {
    return this.model.width
  }

  @HostBinding('attr.height')
  protected get hostHeight() {
    return this.model.height
  }

  @HostBinding('attr.x')
  protected get hostX() {
    return this.model.x
  }

  @HostBinding('attr.y')
  protected get hostY() {
    return this.model.y
  }

  protected model!: ComponentViewModel

  constructor() {
    super()

    if (!this.parent) {
      throw new Error(`injection error`);
    }
  }

  ngOnInit(): void {
    this.model = this.createModel();
  }

  protected modelFactory(): AnyViewModel {
    return new ComponentViewModel(this, this.styleSheet)
  }
}
