import { ContainerStyleSheet } from "../interfaces/stylesheet.interface";

// from lowest to highest
export enum StylesSource {
  hover,
  focus,
  styleSheet,
}

type ElementStyleSheets = { [key in StylesSource]: ContainerStyleSheet | null }

export class StylePrioritizer {
  private readonly _styleStateMachine = declareStyleStateMachine()

  private readonly _elementStyles: ElementStyleSheets

  constructor(styleSheet: Required<ContainerStyleSheet>) {
    this._elementStyles = {
      [StylesSource.styleSheet]: styleSheet,
      [StylesSource.hover]: styleSheet.onHover,
      [StylesSource.focus]: styleSheet.onFocus
    }
  }

  public set(current: StylesSource) {
    this._styleStateMachine[current].isSet = true
  }

  public unset(current: StylesSource) {
    this._styleStateMachine[current].isSet = false
  }

  public getFallback(current: StylesSource): ContainerStyleSheet {
    const fallback = this._elementStyles[this._styleStateMachine[current].fallbackStyle]
    const isSet = this._styleStateMachine[this._styleStateMachine[current].fallbackStyle].isSet

    if (fallback && isSet) {
      return fallback
    }

    return this.getFallback(this._styleStateMachine[current].fallbackStyle)
  }
}

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
    [StylesSource.styleSheet]: {
      fallbackStyle: StylesSource.styleSheet,
      isSet: true
    }
  }
}
