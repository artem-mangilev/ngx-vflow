import { Shadow } from "../../shared/interfaces/filter.interface"

export interface StyleSheet { }

export interface BlockStyleSheet extends
  StyleSheet,
  Partial<WithWidth>,
  Partial<WithHeight>,
  Partial<WithMargin>,
  Partial<WithShadow> {
  onHover?: this | null
  onFocus?: this | null
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
  animation?: Animation | null
}

export interface HtmlStyleSheet extends BlockStyleSheet { }

export interface ImageStyleSheet extends BlockStyleSheet { }

interface WithWidth {
  width: number
}

interface WithHeight {
  height: number
}

interface WithMargin {
  marginLeft: number | 'auto'
  marginRight: number | 'auto'
  marginBottom: number
  marginTop: number
}

interface WithShadow {
  boxShadow?: Shadow | null
}

export interface Animation {
  property: 'borderRadius'
  from: number
  to: number
  duration: number
}

export type AnimationProperty = 'borderRadius'
