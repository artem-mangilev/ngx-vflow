import { Subject, Subscription } from "rxjs";
import { VDocViewComponent } from "../components/vdoc-view/vdoc-view.component";
import { StyleSheet } from '../interfaces/stylesheet.interface';
import { Signal } from "@angular/core";

export abstract class AnyViewModel {
  protected _subscription = new Subscription()

  public parent: AnyViewModel | null = null
  public children: AnyViewModel[] = []

  public abstract width: Signal<number>
  public abstract height: Signal<number>

  public abstract component: VDocViewComponent
  public abstract styleSheet: StyleSheet;

  public abstract calculateLayout(): void


  public destroy() {
    this._subscription.unsubscribe()
  }
}
