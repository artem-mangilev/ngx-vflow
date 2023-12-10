import { VDocViewComponent } from "../components/vdoc-view/vdoc-view.component";

export abstract class AnyViewModel {
  public parent: AnyViewModel | null = null;
  public children: AnyViewModel[] = [];

  public abstract component: VDocViewComponent;

  public abstract calculateLayout(): void;
}
