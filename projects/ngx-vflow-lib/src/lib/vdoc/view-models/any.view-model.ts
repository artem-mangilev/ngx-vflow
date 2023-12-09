import { VDocViewComponent } from "../components/vdoc-view/vdoc-view.component";

export abstract class AnyViewModel {
  public parent: AnyViewModel | null = null;
  public children: AnyViewModel[] = [];

  abstract component: VDocViewComponent;
}
