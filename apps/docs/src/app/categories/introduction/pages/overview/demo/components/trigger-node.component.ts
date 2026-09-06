import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CustomNodeComponent, Vflow } from 'ngx-vflow';

@Component({
  template: `
    <div class="trigger-node">
      <div class="node-header">
        <svg class="icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 3L12 8L4 13V3Z" fill="currentColor" />
        </svg>
        <span class="title">A node can be anything</span>
      </div>
      <div class="node-content">
        <iframe width="100%" height="100%" src="https://www.youtube.com/embed/dQw4w9WgXcQ"> </iframe>
      </div>

      <handle type="source" position="right" />
    </div>
  `,
  styles: [
    `
      iframe {
        border: none;
        frameborder: 0;
        background-color: transparent;
        margin: 0;
        padding: 0;
        display: block;
      }

      .trigger-node {
        width: 220px;
        background: white;
        border: 2px solid var(--accent-violet);
        border-radius: 8px;
        box-shadow:
          0 1px 3px rgba(0, 0, 0, 0.08),
          0 1px 2px rgba(0, 0, 0, 0.06);
        overflow: hidden;
      }

      .node-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 14px;
        background: white;
        border-bottom: 2px solid var(--accent-violet);
        color: var(--accent-violet);
      }

      .icon {
        flex-shrink: 0;
      }

      .title {
        font-size: 14px;
        font-weight: 600;
        letter-spacing: -0.01em;
        color: var(--text-primary);
      }

      .node-content {
        padding: 12px 14px;
        background: white;
      }

      .subtitle {
        font-size: 13px;
        color: var(--text-muted);
        font-weight: 500;
      }
    `,
  ],
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriggerNodeComponent extends CustomNodeComponent {}
