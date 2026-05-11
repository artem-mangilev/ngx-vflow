import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ChildrenOutletContexts } from '@angular/router';
import { routingAnimation } from './animations/routing.animation';

// eslint-disable-next-line @angular-eslint/prefer-standalone
@Component({
  animations: [routingAnimation()],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AppComponent {
  private contexts = inject(ChildrenOutletContexts);

  protected isSponsorBannerVisible = !this.isSponsorBannerDismissed();

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.title;
  }

  dismissSponsorBanner(): void {
    this.isSponsorBannerVisible = false;
    localStorage.setItem('sponsor-banner-dismissed', 'true');
  }

  private isSponsorBannerDismissed(): boolean {
    return localStorage.getItem('sponsor-banner-dismissed') === 'true';
  }
}
