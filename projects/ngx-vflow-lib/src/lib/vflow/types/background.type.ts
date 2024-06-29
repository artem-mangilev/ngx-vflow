export type Background = ColorBackground | DotsBackground

export interface ColorBackground {
  type: 'solid'
  color: string
}

export interface DotsBackground {
  type: 'dots'
  gap?: number
  color?: string
  size?: number
  backgroundColor?: string
}
