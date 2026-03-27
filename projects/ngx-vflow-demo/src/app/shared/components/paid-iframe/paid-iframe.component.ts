import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { map, timer } from 'rxjs';

@Component({
  selector: 'ngx-vflow-paid-iframe',
  template: `
    <div class="iframe-shell" [style.height.px]="450">
      <div class="iframe-placeholder" aria-hidden="true" [class.hidden]="loaded()">
        <div class="shimmer"></div>
        <span>Loading demo...</span>
      </div>

      <iframe
        class="iframe-content"
        allowfullscreen=""
        loading="lazy"
        [class.loaded]="loaded()"
        [src]="safeSrc()"
        [attr.title]="title()"></iframe>
    </div>
  `,
  styles: [
    `
      .iframe-shell {
        position: relative;
        width: 100%;
        overflow: hidden;
        border-radius: 10px;
        background: var(--background-secondary);
      }

      .iframe-placeholder {
        position: absolute;
        inset: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        pointer-events: none;
        opacity: 1;
        transition: opacity 180ms ease-in-out;
      }

      .iframe-placeholder.hidden {
        opacity: 0;
      }

      .shimmer {
        position: absolute;
        inset: 0;
        background:
          linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.24) 50%, rgba(255, 255, 255, 0) 100%),
          linear-gradient(180deg, rgba(127, 127, 127, 0.12) 0%, rgba(127, 127, 127, 0.08) 100%);
        background-size:
          200% 100%,
          100% 100%;
        animation: shimmer 1.6s linear infinite;
      }

      .iframe-content {
        width: 100%;
        height: 100%;
        border: 0;
        display: block;
        opacity: 0;
        transition: opacity 220ms ease-in-out;
      }

      .iframe-content.loaded {
        opacity: 1;
      }

      @keyframes shimmer {
        0% {
          background-position:
            100% 0,
            0 0;
        }
        100% {
          background-position:
            -100% 0,
            0 0;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaidIframeComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly src = input.required<string>();

  readonly safeSrc = computed(() => this.sanitizer.bypassSecurityTrustResourceUrl(this.src()));

  readonly title = input.required<string>();

  public loaded = toSignal(timer(3000).pipe(map(() => true)), { initialValue: false });
}
