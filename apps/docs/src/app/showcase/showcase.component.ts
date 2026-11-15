import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SHOWCASE_PROJECTS } from './projects';

@Component({
  selector: 'app-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block font-doc text-doc-text' },
  template: `
    <div class="mx-auto max-w-[1120px] px-6 pt-14 pb-24">
      <header class="mb-12 max-w-[62ch]">
        <h1 class="m-0 mb-4 text-[clamp(36px,5vw,52px)] leading-[1.05] font-bold tracking-[-0.03em] text-doc-heading">
          Showcase
        </h1>
        <p class="m-0 text-[17px] leading-[1.6] text-doc-muted">
          Projects that build their editors and diagrams with ngx-vflow. To add yours,
          <a
            class="text-doc-link"
            href="https://github.com/artem-mangilev/ngx-vflow/issues/new"
            target="_blank"
            rel="noreferrer"
            >open an issue</a
          >
          with a link and a screenshot.
        </p>
      </header>

      <ul class="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,440px),1fr))] gap-x-10 gap-y-12 p-0">
        @for (project of projects; track project.name) {
          <li>
            <a
              class="mb-5 block aspect-16/10 overflow-hidden rounded-[10px] border border-doc-border bg-doc-base-1 text-doc-link"
              target="_blank"
              rel="noreferrer"
              tabindex="-1"
              [href]="project.website">
              <img
                class="block size-full object-cover object-top-left"
                loading="lazy"
                [src]="project.image"
                [alt]="'Screenshot of ' + project.name" />
            </a>
            <h2 class="m-0 mb-2 text-[22px] font-[650] tracking-[-0.015em] text-doc-heading">{{ project.name }}</h2>
            <p class="m-0 text-[15px] leading-[1.6] text-doc-muted">{{ project.description }}</p>
            <p class="m-0 mt-3 flex gap-5 text-[15px] leading-[1.6] text-doc-muted">
              <a class="text-doc-link" target="_blank" rel="noreferrer" [href]="project.website">Website</a>
              <a class="text-doc-link" target="_blank" rel="noreferrer" [href]="project.repository">Repository</a>
            </p>
          </li>
        }
      </ul>
    </div>
  `,
})
export class ShowcaseComponent {
  protected readonly projects = SHOWCASE_PROJECTS;
}
