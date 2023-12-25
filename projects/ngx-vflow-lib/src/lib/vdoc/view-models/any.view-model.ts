import { Subject, Subscription } from "rxjs";
import { VDocViewComponent } from "../components/vdoc-view/vdoc-view.component";
import { StyleSheet } from '../interfaces/stylesheet.interface';

export abstract class AnyViewModel {
  protected _subscription = new Subscription()
  private _viewUpdate$ = new Subject<void>()

  public parent: AnyViewModel | null = null
  public children: AnyViewModel[] = []

  public viewUpdate$ = this._viewUpdate$.asObservable();

  public abstract width: number
  public abstract height: number

  public abstract component: VDocViewComponent
  public abstract styleSheet: StyleSheet;

  public abstract calculateLayout(): void

  public updateView(): void {
    this._viewUpdate$.next();
  }

  public destroy() {
    this._subscription.unsubscribe()
  }
}
