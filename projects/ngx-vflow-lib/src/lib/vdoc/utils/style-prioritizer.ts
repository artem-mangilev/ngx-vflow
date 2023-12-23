import { ContainerStyleSheet } from "../interfaces/stylesheet.interface";

// from lowest to highest
export enum PseudoStylePriority {
  hover,
  focus,
  styleSheet,
}

type ElementStyleSheets = { [key in PseudoStylePriority]: ContainerStyleSheet | null }

export class StylePrioritizer {
  private _styleStateMachine = {
    [PseudoStylePriority.focus]: {
      fallbackStyle: PseudoStylePriority.styleSheet,
      isSet: false
    },
    [PseudoStylePriority.hover]: {
      fallbackStyle: PseudoStylePriority.focus,
      isSet: false
    },
    [PseudoStylePriority.styleSheet]: {
      fallbackStyle: PseudoStylePriority.styleSheet,
      isSet: true
    }
  }

  private _elementStyles: ElementStyleSheets

  constructor(styleSheet: Required<ContainerStyleSheet>) {
    this._elementStyles = {
      [PseudoStylePriority.styleSheet]: styleSheet,
      [PseudoStylePriority.hover]: styleSheet.onHover,
      [PseudoStylePriority.focus]: styleSheet.onFocus
    }
  }

  public set(current: PseudoStylePriority) {
    this._styleStateMachine[current].isSet = true
  }

  public unset(current: PseudoStylePriority) {
    this._styleStateMachine[current].isSet = false
  }

  public getFallback(current: PseudoStylePriority): ContainerStyleSheet {
    const fallback = this._elementStyles[this._styleStateMachine[current].fallbackStyle]
    const isSet = this._styleStateMachine[this._styleStateMachine[current].fallbackStyle].isSet

    if (fallback && isSet) {
      return fallback
    }

    return this.getFallback(this._styleStateMachine[current].fallbackStyle)
  }
}
