import { Signal } from "@angular/core"
import { Shadow } from "../../shared/interfaces/filter.interface"
import { Animation } from './animation.interface'

export interface StyleSheet { }

export interface BlockStyleSheet extends
  StyleSheet,
  Partial<WithWidth>,
  Partial<WithHeight>,
  Partial<WithMargin>,
  Partial<WithShadow> { }

export interface RootStyleSheet extends
  StyleSheet,
  WithWidth, // Root must have width
  Partial<WithHeight> { }

export interface ContainerStyleSheet extends BlockStyleSheet {
  backgroundColor?: Signal<string>
  borderColor?: Signal<string>
  borderRadius?: Signal<number>
  borderWidth?: Signal<number>,

  // it's not a signal, because animation is statically defined and run on selector match
  animation?: { [selector: string]: Animation | Animation[] }
}

export interface HtmlStyleSheet extends BlockStyleSheet { }

interface WithWidth {
  width: Signal<number>
}

interface WithHeight {
  height: Signal<number>
}

interface WithMargin {
  marginLeft: Signal<number | 'auto'>
  marginRight: Signal<number | 'auto'>
  marginBottom: Signal<number>
  marginTop: Signal<number>
}

interface WithShadow {
  boxShadow?: Signal<Shadow | null>
}

