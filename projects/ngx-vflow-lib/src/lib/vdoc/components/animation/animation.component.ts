import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, OnInit, ViewChild, inject } from '@angular/core';
import { Animation, AnimationProperty } from '../../interfaces/stylesheet.interface';

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

const attrMap = {
  'borderRadius': 'rx'
}
