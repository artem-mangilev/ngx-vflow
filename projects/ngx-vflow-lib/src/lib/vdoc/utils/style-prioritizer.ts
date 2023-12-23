import { ContainerStyleSheet } from "../interfaces/stylesheet.interface";

// from lowest to highest
export enum StylesPriority {
  hover,
  focus,
  styleSheet,
}

type ElementStyleSheets = { [key in StylesPriority]: ContainerStyleSheet | null }

export class StylePrioritizer {
  private readonly _styleStateMachine = declareStyleStateMachine()

  private readonly _elementStyles: ElementStyleSheets

  constructor(styleSheet: Required<ContainerStyleSheet>) {
    this._elementStyles = {
      [StylesPriority.styleSheet]: styleSheet,
      [StylesPriority.hover]: styleSheet.onHover,
      [StylesPriority.focus]: styleSheet.onFocus
    }
  }

  public set(current: StylesPriority) {
    this._styleStateMachine[current].isSet = true
  }

  public unset(current: StylesPriority) {
    this._styleStateMachine[current].isSet = false
  }

  public getFallback(current: StylesPriority): ContainerStyleSheet {
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
    [StylesPriority.focus]: {
      fallbackStyle: StylesPriority.styleSheet,
      isSet: false
    },
    [StylesPriority.hover]: {
      fallbackStyle: StylesPriority.focus,
      isSet: false
    },
    [StylesPriority.styleSheet]: {
      fallbackStyle: StylesPriority.styleSheet,
      isSet: true
    }
  }
}
