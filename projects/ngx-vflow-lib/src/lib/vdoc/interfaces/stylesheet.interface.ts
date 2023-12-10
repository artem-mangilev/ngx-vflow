export interface StyleSheet {

}

export interface RootStyleSheet extends
  StyleSheet,
  WithWidth, // Root must have width
  Partial<WithHeight> { }

export interface BlockStyleSheet extends
  StyleSheet,
  WithWidth,
  Partial<WithHeight> {
  marginBottom: number
  backgroundColor: string
  borderRadius: number
}

interface WithWidth {
  width: number
}

interface WithHeight {
  height: number
}
