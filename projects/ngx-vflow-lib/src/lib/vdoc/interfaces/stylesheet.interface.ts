import { Signal } from "@angular/core"
import { Shadow } from "../../shared/interfaces/filter.interface"
import { Animation } from './animation.interface'

export interface StyleSheet { }

export interface BlockStyleSheet extends
  StyleSheet,
  Partial<WithWidth>,
  Partial<WithHeight>,
  Partial<WithMargin>,
  Partial<WithShadow> {
  onHover?: this | null
  onFocus?: this | null
  // 0 field is className
  onClass?: [string, this][]
}

export interface RootStyleSheet extends
  StyleSheet,
  WithWidth, // Root must have width
  Partial<WithHeight> { }

export interface ContainerStyleSheet extends BlockStyleSheet {
  backgroundColor?: string
  borderColor?: string
  borderRadius?: number
  borderWidth?: number,
  animation?: Animation | Animation[] | null
}

export interface HtmlStyleSheet extends BlockStyleSheet { }

export interface ImageStyleSheet extends BlockStyleSheet { }

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

