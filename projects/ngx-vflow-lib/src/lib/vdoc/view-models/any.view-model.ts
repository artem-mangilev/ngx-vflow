import { VDocViewComponent } from "../components/vdoc-view/vdoc-view.component";
import { StyleSheet } from '../interfaces/stylesheet.interface';

export abstract class AnyViewModel {
  public parent: AnyViewModel | null = null
  public children: AnyViewModel[] = []

  public abstract width: number
  public abstract height: number

  public abstract component: VDocViewComponent
  public abstract styleSheet: StyleSheet;

  public abstract calculateLayout(): void
}
