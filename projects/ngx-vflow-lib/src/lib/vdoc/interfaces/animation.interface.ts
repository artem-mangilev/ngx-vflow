export type Animation =
  BorderRadiusAnimation |
  BorderWidthAnimation |
  BorderColorAnimation |
  BackgroundColorAnimation

export type AnimationProperty = Animation['property']

export type AnimationFunction = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out'

interface BorderRadiusAnimation extends WithValuesOfType<number>, WithDuration, WithAnimationFunction {
  property: 'borderRadius'
}

interface BorderWidthAnimation extends WithValuesOfType<number>, WithDuration, WithAnimationFunction {
  property: 'borderWidth'
}

interface BorderColorAnimation extends WithValuesOfType<string>, WithDuration, WithAnimationFunction {
  property: 'borderColor'
}

interface BackgroundColorAnimation extends WithValuesOfType<string>, WithDuration, WithAnimationFunction {
  property: 'backgroundColor'
}

interface WithDuration {
  duration: number
}

interface WithValuesOfType<T> {
  from: T
  to: T
}

interface WithAnimationFunction {
  animationFunction?: AnimationFunction
}
