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
  backgroundColor?: string
  borderColor?: string
  borderRadius?: number
  borderWidth?: number

  onHover?: ContainerStyleSheet | null
  onFocus?: ContainerStyleSheet | null
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

interface Shadow {
  hOffset: number
  vOffset: number
  blur: number,
  color: string
}
