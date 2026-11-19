import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { DemoIconComponent, DocsNodeIcon } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { Vflow } from 'ngx-vflow';

/**
 * A node is a component, so its content is anything a component can render: here, an embedded video.
 *
 * The player is loaded when the reader asks for it. An embedded player brings its scripts, fonts and advertising
 * requests with it, and this node is on the landing page; until the press it is one picture of the video.
 */
@Component({
  template: `
    <article vuiNode class="w-55 text-[13px]">
      <header vuiNodeHeader>
        <span docsNodeIcon tile class="[--icon-color:var(--color-violet-500)]"><app-demo-icon name="play" /></span>
        <span vuiTitle>A node can be anything</span>
      </header>
      <div class="p-vui-3">
        @if (playing()) {
          <iframe
            #player
            class="block aspect-video w-full rounded-vui-control border-0"
            title="A video inside a node"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowfullscreen
            src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"></iframe>
        } @else {
          <!-- A press plays the video, so it neither drags nor selects the node, like the player it stands for. -->
          <button
            type="button"
            vNoDrag
            vNoSelect
            class="group relative block aspect-video w-full cursor-pointer overflow-hidden rounded-vui-control border-0 bg-black p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vui-accent"
            aria-label="Play the video"
            (click)="play()">
            <img
              class="block size-full object-cover"
              alt=""
              loading="lazy"
              draggable="false"
              src="https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg" />
            <span
              class="absolute top-1/2 left-1/2 grid size-10 -translate-1/2 place-items-center rounded-full bg-black/65 text-white transition-colors group-hover:bg-black/80 [&_svg]:fill-current">
              <app-demo-icon name="play" />
            </span>
          </button>
        }
      </div>
      <span vuiPort handleType="source" position="right"></span>
    </article>
  `,
  imports: [Vflow, Vui, DocsNodeIcon, DemoIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriggerNodeComponent {
  private readonly injector = inject(Injector);
  private readonly player = viewChild<ElementRef<HTMLIFrameElement>>('player');

  protected readonly playing = signal(false);

  protected play(): void {
    this.playing.set(true);
    // The button that had the focus is gone: the player takes it, so the keyboard goes on from the same place.
    afterNextRender(() => this.player()?.nativeElement.focus(), { injector: this.injector });
  }
}
