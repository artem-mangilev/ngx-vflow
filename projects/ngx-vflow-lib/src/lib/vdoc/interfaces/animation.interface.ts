export type Animation =
  BorderRadiusAnimation |
  BorderWidthAnimation |
  BorderColorAnimation |
  BackgroundColorAnimation

export type AnimationProperty = Animation['property']

export type AnimationFunction = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out'

interface BorderRadiusAnimation extends WithNumberValues, WithDuration, WithAnimationFunction {
  property: 'borderRadius'
}

interface BorderWidthAnimation extends WithNumberValues, WithDuration, WithAnimationFunction {
  property: 'borderWidth'
}

interface BorderColorAnimation extends WithStringValues, WithDuration, WithAnimationFunction {
  property: 'borderColor'
}

interface BackgroundColorAnimation extends WithStringValues, WithDuration, WithAnimationFunction {
  property: 'backgroundColor'
}

interface WithDuration {
  duration: number
}

interface WithStringValues {
  from: string
  to: string
}

interface WithNumberValues {
  from: number
  to: number
}

interface WithAnimationFunction {
  animationFunction?: AnimationFunction
}
