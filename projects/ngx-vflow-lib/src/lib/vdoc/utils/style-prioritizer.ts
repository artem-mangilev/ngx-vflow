import { BlockStyleSheet } from "../interfaces/stylesheet.interface";

export enum StylesSource {
  hover,
  focus,
  styleSheet,
  dynanic
}

export class StylePrioritizer {
  private readonly _styleStateMachine = declareStyleStateMachine()

  private readonly _elementStyles: { [key in StylesSource]: BlockStyleSheet | null }

  constructor(styleSheet: Required<BlockStyleSheet>) {
    // Extract sub-stylesheets from main stylesheet
    this._elementStyles = {
      [StylesSource.styleSheet]: styleSheet,
      [StylesSource.hover]: styleSheet.onHover,
      [StylesSource.focus]: styleSheet.onFocus,
      [StylesSource.dynanic]: null
    }
  }

  public setDynamicStyle(style: BlockStyleSheet | null) {
    this._elementStyles[StylesSource.dynanic] = style
  }

  /**
   * Set stylesheet as active by source
   *
   * @param current
   */
  public set(current: StylesSource) {
    this._styleStateMachine[current].isSet = true
  }

  /**
   * Deactivate stylesheet by source
   *
   * @param current
   */
  public unset(current: StylesSource) {
    this._styleStateMachine[current].isSet = false
  }

  /**
   * get fallback style relative to current style
   *
   * @param current source of styles
   * @returns fallback stylesheet
   */
  public getFallback(current: StylesSource): BlockStyleSheet {
    const fallbackSource = this._styleStateMachine[current].fallbackStyle

    const fallbackStyles = this._elementStyles[fallbackSource]
    const isSet = this._styleStateMachine[fallbackSource].isSet

    if (fallbackStyles && isSet) {
      return fallbackStyles
    }

    return this.getFallback(fallbackSource)
  }
}

/**
 * Stylesheet dependency state machine
 *
 * @returns state machine
 */
function declareStyleStateMachine() {
  return {
    [StylesSource.focus]: {
      fallbackStyle: StylesSource.styleSheet,
      isSet: false
    },
    [StylesSource.hover]: {
      fallbackStyle: StylesSource.focus,
      isSet: false
    },
    [StylesSource.dynanic]: {
      fallbackStyle: StylesSource.styleSheet,
      isSet: false
    },
    [StylesSource.styleSheet]: {
      fallbackStyle: StylesSource.styleSheet,
      // it's always activated
      isSet: true
    },
  }
}
