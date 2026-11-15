import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SHOWCASE_PROJECTS } from './projects';

@Component({
  selector: 'app-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="showcase">
      <header class="showcase__header">
        <h1>Showcase</h1>
        <p>
          Projects that build their editors and diagrams with ngx-vflow. To add yours,
          <a href="https://github.com/artem-mangilev/ngx-vflow/issues/new" target="_blank" rel="noreferrer"
            >open an issue</a
          >
          with a link and a screenshot.
        </p>
      </header>

      <ul class="showcase__list">
        @for (project of projects; track project.name) {
          <li class="project">
            <a class="project__shot" target="_blank" rel="noreferrer" tabindex="-1" [href]="project.website">
              <img loading="lazy" [src]="project.image" [alt]="'Screenshot of ' + project.name" />
            </a>
            <h2>{{ project.name }}</h2>
            <p>{{ project.description }}</p>
            <p class="project__links">
              <a target="_blank" rel="noreferrer" [href]="project.website">Website</a>
              <a target="_blank" rel="noreferrer" [href]="project.repository">Repository</a>
            </p>
          </li>
        }
      </ul>
    </div>
  `,
  styles: `
    :host {
      display: block;
      font-family: var(--ng-doc-font-family);
      color: var(--ng-doc-text);
    }

    .showcase {
      max-width: 1120px;
      margin: 0 auto;
      padding: 56px 24px 96px;
    }

    .showcase__header {
      max-width: 62ch;
      margin-bottom: 48px;
    }

    h1 {
      margin: 0 0 16px;
      color: var(--ng-doc-heading-color);
      font-size: clamp(36px, 5vw, 52px);
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.05;
    }

    p {
      margin: 0;
      color: var(--ng-doc-text-muted);
      font-size: 17px;
      line-height: 1.6;
    }

    a {
      color: var(--ng-doc-link-color);
    }

    .showcase__list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 440px), 1fr));
      gap: 48px 40px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .project__shot {
      display: block;
      aspect-ratio: 16 / 10;
      margin-bottom: 20px;
      overflow: hidden;
      border: 1px solid var(--ng-doc-border-color);
      border-radius: 10px;
      background: var(--ng-doc-base-1);
    }

    .project__shot img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top left;
    }

    h2 {
      margin: 0 0 8px;
      color: var(--ng-doc-heading-color);
      font-size: 22px;
      font-weight: 650;
      letter-spacing: -0.015em;
    }

    .project p {
      font-size: 15px;
    }

    .project__links {
      display: flex;
      gap: 20px;
      margin-top: 12px;
    }
  `,
})
export class ShowcaseComponent {
  protected readonly projects = SHOWCASE_PROJECTS;
}
