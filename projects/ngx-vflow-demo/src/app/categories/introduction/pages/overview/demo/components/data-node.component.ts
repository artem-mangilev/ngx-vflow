import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CustomNodeComponent, Vflow } from 'ngx-vflow';

@Component({
  template: `
    <div class="data-node">
      <div class="node-header">
        <svg class="icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="3" width="12" height="2.5" rx="1" fill="currentColor" />
          <rect x="2" y="6.75" width="12" height="2.5" rx="1" fill="currentColor" />
          <rect x="2" y="10.5" width="12" height="2.5" rx="1" fill="currentColor" />
        </svg>
        <span class="title">For example, a table</span>
      </div>
      <div class="node-content">
        @for (field of fields; track field.name) {
          <div class="field-row">
            <span class="field-name">{{ field.name }}</span>
            <span class="field-type">{{ field.type }}</span>
          </div>
        }
      </div>

      <handle type="target" position="left" />
      <handle type="source" position="right" />
    </div>
  `,
  styles: [
    `
      .data-node {
        width: 200px;
        background: white;
        border: 2px solid var(--accent-emerald);
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
        border-bottom: 2px solid var(--accent-emerald);
        color: var(--accent-emerald);
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
        padding: 10px 14px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        background: white;
      }

      .field-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        padding: 4px 0;
      }

      .field-name {
        color: var(--text-primary);
        font-weight: 500;
      }

      .field-type {
        color: var(--text-muted);
        font-family: 'Monaco', 'Courier New', monospace;
        font-size: 11px;
      }
    `,
  ],
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataNodeComponent extends CustomNodeComponent {
  protected fields = [
    { name: 'id', type: 'number' },
    { name: 'name', type: 'string' },
    { name: 'count', type: 'number' },
  ];
}
