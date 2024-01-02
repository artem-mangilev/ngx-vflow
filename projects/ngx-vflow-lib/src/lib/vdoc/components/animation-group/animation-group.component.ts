import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChildren } from '@angular/core';
import { Animation } from '../../interfaces/stylesheet.interface';
import { AnimationComponent } from '../animation/animation.component';

@Component({
  selector: 'g[animationGroup]',
  template: `
    <svg:g
      *ngFor="let animation of animationGroup"
      [id]="id"
      [animation]="animation"
    ></svg:g>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnimationGroupComponent {
  @Input({ transform: (animation: Animation | Animation[]) => Array.isArray(animation) ? animation : [animation] })
  public animationGroup!: Animation[]

  @Input()
  public id!: string;

  @ViewChildren(AnimationComponent)
  protected animationComponents!: AnimationComponent[];

  public begin(options: { reverseOnceComplete: boolean } = { reverseOnceComplete: false }) {
    this.animationComponents.forEach(a => a.begin(options))
  }

  public reverse() {
    this.animationComponents.forEach(a => a.reverse())
  }
}
