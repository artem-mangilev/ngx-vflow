import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import {
  NgDocCustomSidebarDirective,
  NgDocNavbarComponent,
  NgDocRootComponent,
  NgDocThemeToggleComponent,
} from '@ng-doc/app';
import { NgDocButtonIconComponent, NgDocIconComponent, NgDocTooltipDirective } from '@ng-doc/ui-kit';
import { filter, map } from 'rxjs';
import { injectDocsTheme } from './shared/docs-theme';
import { SectionSidebarComponent } from './shell/section-sidebar.component';
import { Section, SECTION_TABS, tabOfUrl } from './shell/sections';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    NgDocRootComponent,
    NgDocNavbarComponent,
    NgDocCustomSidebarDirective,
    NgDocThemeToggleComponent,
    NgDocIconComponent,
    NgDocButtonIconComponent,
    NgDocTooltipDirective,
    SectionSidebarComponent,
  ],
})
export class AppComponent {
  private readonly router = inject(Router);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly tabs = SECTION_TABS;

  /** The tab of the current page; `null` on the landing page. */
  protected readonly activeTab = computed(() => tabOfUrl(this.url()));

  /** The section whose sidebar is shown; pages outside a section, the landing and the showcase, have none. */
  protected readonly section = computed<Section | null>(() => {
    const tab = this.activeTab();

    return tab === 'showcase' ? null : tab;
  });

  constructor() {
    // Every flow of the site takes the vflow UI theme of the docs theme: the scope is the document itself.
    const theme = injectDocsTheme();
    const root = inject(DOCUMENT).documentElement;

    effect(() => root.setAttribute('data-vui-theme', theme()));
  }
}
