import { Type, forwardRef } from "@angular/core"
import { VDocViewComponent } from "../components/vdoc-view/vdoc-view.component"

export const provideComponent = (ctor: Type<any>) => {
  return { provide: VDocViewComponent, useExisting: forwardRef(() => ctor) }
}
