import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, OnInit, ViewChild, inject } from '@angular/core';
import { Animation, AnimationFunction, AnimationProperty } from '../../interfaces/animation.interface';

@Component({
  selector: 'g[animation]',
  template: `
    <svg:animate
      #animate
      [attr.xlink:href]="'#' + id"
      [attr.attributeName]="getAttrName(animation.property)"
      [attr.from]="animation.from"
      [attr.to]="animation.to"
      [attr.dur]="animation.duration + 'ms'"
      [attr.keySplines]="animationFunctions[animationFunctionName]"
      keyTimes="0;1"
      calcMode="spline"
      fill="freeze"
      begin="indefinite"
    ></svg:animate>

    <svg:animate
      #animateReverse
      [attr.xlink:href]="'#' + id"
      [attr.attributeName]="getAttrName(animation.property)"
      [attr.from]="animation.to"
      [attr.to]="animation.from"
      [attr.dur]="animation.duration + 'ms'"
      [attr.keySplines]="animationFunctions[animationFunctionName]"
      keyTimes="0;1"
      calcMode="spline"
      fill="freeze"
      begin="indefinite"
    ></svg:animate>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnimationComponent {
  @Input()
  public animation!: Animation

  @Input()
  public id!: string

  @ViewChild('animate')
  private animateElementRef?: ElementRef<SVGAnimateElement>

  @ViewChild('animateReverse')
  private animateReverseElementRef?: ElementRef<SVGAnimateElement>

  protected get animationFunctionName() {
    return this.animation.animationFunction ?? 'linear'
  }

  protected animationFunctions = animationFunctions

  public begin(options: { reverseOnceComplete: boolean } = { reverseOnceComplete: false }) {
    this.animateElementRef?.nativeElement.beginElement()

    if (options.reverseOnceComplete) {
      setTimeout(() => this.reverse(), this.animation.duration);
    }
  }

  public reverse() {
    this.animateReverseElementRef?.nativeElement.beginElement()
  }

  protected getAttrName(property: AnimationProperty) {
    return attrMap[property]
  }
}

const attrMap: { [prop in AnimationProperty]: string } = {
  'borderRadius': 'rx',
  'borderWidth': 'stroke-width',
  'borderColor': 'stroke',
  'backgroundColor': 'fill'
}

const animationFunctions: { [key in AnimationFunction]: string } = {
  'linear': '0 0 1 1',
  'ease': '0.25 1 0.25 1',
  'ease-in': '0.42 0 1 1',
  'ease-out': '0 0 0.58 1',
  'ease-in-out': '0.42 0 0.58 1',
}
