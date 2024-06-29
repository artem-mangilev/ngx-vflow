export type Background = ColorBackground | DotsBackground

interface ColorBackground {
  type: 'solid'
  color: string
}

interface DotsBackground {
  type: 'dots'
  gap?: number
  color?: string
  size?: number
  backgroundColor?: string
}
