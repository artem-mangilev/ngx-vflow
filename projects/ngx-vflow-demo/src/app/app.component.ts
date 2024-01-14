import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ChildrenOutletContexts } from '@angular/router';
import { routingAnimation } from './animations/routing.animation';

@Component({
  animations: [routingAnimation()],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private contexts = inject(ChildrenOutletContexts)

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.title
  }
}
