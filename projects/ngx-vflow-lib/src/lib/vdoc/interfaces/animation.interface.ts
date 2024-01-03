export type Animation =
  BorderRadiusAnimation |
  BorderWidthAnimation |
  BorderColorAnimation |
  BackgroundColorAnimation

export type AnimationProperty = 'borderRadius' | 'borderWidth' | 'borderColor' | 'backgroundColor'

interface BorderRadiusAnimation {
  property: 'borderRadius'
  from: number
  to: number
  duration: number
  animationFunction?: AnimationFunction
}

interface BorderWidthAnimation {
  property: 'borderWidth'
  from: number
  to: number,
  duration: number
  animationFunction?: AnimationFunction
}

interface BorderColorAnimation {
  property: 'borderColor'
  from: string
  to: string,
  duration: number
  animationFunction?: AnimationFunction
}

interface BackgroundColorAnimation {
  property: 'backgroundColor'
  from: string
  to: string,
  duration: number
  animationFunction?: AnimationFunction
}

export type AnimationFunction = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out'
