export type Animation =
  BorderRadiusAnimation |
  BorderWidthAnimation |
  BorderColorAnimation |
  BackgroundColorAnimation

export type AnimationProperty = 'borderRadius' | 'borderWidth' | 'borderColor' | 'backgroundColor'

interface BorderRadiusAnimation {
  property: 'borderRadius'
  from: number
  to: number,
  duration: number
}

interface BorderWidthAnimation {
  property: 'borderWidth'
  from: number
  to: number,
  duration: number
}

interface BorderColorAnimation {
  property: 'borderColor'
  from: string
  to: string,
  duration: number
}

interface BackgroundColorAnimation {
  property: 'backgroundColor'
  from: string
  to: string,
  duration: number
}
