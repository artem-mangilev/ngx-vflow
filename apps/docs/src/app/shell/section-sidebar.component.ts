import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, Injector, input } from '@angular/core';
import { NgDocSidebarComponent } from '@ng-doc/app';
import { NG_DOC_CONTEXT } from '@ng-doc/app/tokens';
import { navigationOfSection, Section } from './sections';

/**
 * The sidebar of one section. The NgDoc sidebar reads the navigation of the whole site from its context once, so
 * each section gets its own sidebar instance with a context that holds only the items of that section.
 */
@Component({
  selector: 'app-section-sidebar',
  template: `<ng-container *ngComponentOutlet="sidebar; injector: injector()" />`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgComponentOutlet],
})
export class SectionSidebarComponent {
  readonly section = input.required<Section>();

  protected readonly sidebar = NgDocSidebarComponent;

  private readonly context = inject(NG_DOC_CONTEXT);
  private readonly parent = inject(Injector);

  protected readonly injector = computed(() =>
    Injector.create({
      parent: this.parent,
      providers: [
        {
          provide: NG_DOC_CONTEXT,
          useValue: { ...this.context, navigation: navigationOfSection(this.context.navigation, this.section()) },
        },
      ],
    }),
  );
}
