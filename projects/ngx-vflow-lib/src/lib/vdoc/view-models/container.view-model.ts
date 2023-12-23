import { Observable, Subject, Subscriber, Subscription, filter, map, merge, of, tap } from "rxjs";
import { VDocViewComponent } from "../components/vdoc-view/vdoc-view.component";
import { ContainerStyleSheet } from "../interfaces/stylesheet.interface";
import { BlockViewModel } from "./block.view-model";

export enum PseudoEvent {
  hoverIn,
  hoverOut
}

export class ContainerViewModel extends BlockViewModel {
  public contentHeight = 0
  public contentWidth = 0
  public contentX = 0
  public contentY = 0
  public borderColor = ''
  public backgroundColor = ''

  public styleSheet: Required<ContainerStyleSheet>;

  private _preudoEvent$ = new Subject<PseudoEvent>()
  private _subscription = new Subscription()

  constructor(
    public component: VDocViewComponent,
    styleSheet: ContainerStyleSheet
  ) {
    super();

    this.styleSheet = styleSheetWithDefaults(styleSheet)

    this.borderColor = this.styleSheet.borderColor
    this.backgroundColor = this.styleSheet.backgroundColor

    this._subscription.add(
      this.registerPseudo().subscribe()
    )
  }

  public triggerPseudoEvent(event: PseudoEvent) {
    this._preudoEvent$.next(event)
  }

  public destroy() {
    this._subscription.unsubscribe()
  }

  protected override calculateHeight(): void {
    super.calculateHeight()

    // rect height is increased by borderWidth if it applied, so we need decrease
    // it by this value in order to fit into parent element
    this.contentHeight = this.height - this.styleSheet.borderWidth
  }

  protected override calculateWidth(): void {
    super.calculateWidth()

    // rect width is increased by borderWidth if it applied, so we need decrease
    // it back by this value in order to fit into parent element
    this.contentWidth = this.width - this.styleSheet.borderWidth
  }

  protected override calculatePosition(): void {
    super.calculatePosition()

    // TODO explain this logic
    this.contentX = this.styleSheet.borderWidth / 2
    this.contentY = this.styleSheet.borderWidth / 2
  }

  private registerPseudo(): Observable<void> {
    const hoverEvent$ = this.styleSheet.onHover
      ? this._preudoEvent$
        .pipe(
          filter((event) => [PseudoEvent.hoverIn, PseudoEvent.hoverOut].includes(event)),
          tap((event) => this.handleHover(event, this.styleSheet.onHover!))
        )
      : of(null)


    return merge(hoverEvent$).pipe(
      map(() => undefined)
    )
  }

  private handleHover(event: PseudoEvent, hoverStyles: ContainerStyleSheet) {
    if (event === PseudoEvent.hoverIn) {
      if (hoverStyles.borderColor) {
        this.borderColor = hoverStyles.borderColor
      }

      if (hoverStyles.backgroundColor) {
        this.backgroundColor = hoverStyles.backgroundColor
      }
    } else {
      this.borderColor = this.styleSheet.borderColor
      this.backgroundColor = this.styleSheet.backgroundColor
    }
  }
}

function styleSheetWithDefaults(styles: ContainerStyleSheet): Required<ContainerStyleSheet> {
  return {
    width: styles.width ?? 0,
    height: styles.height ?? 0,
    marginLeft: styles.marginLeft ?? 0,
    marginRight: styles.marginRight ?? 0,
    marginBottom: styles.marginBottom ?? 0,
    marginTop: styles.marginTop ?? 0,
    backgroundColor: styles.backgroundColor ?? '',
    borderColor: styles.borderColor ?? '',
    borderWidth: styles.borderWidth ?? 0,
    borderRadius: styles.borderRadius ?? 0,
    onHover: styles.onHover ?? null,
    ...styles
  }
}

