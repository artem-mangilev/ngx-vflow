import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CustomNodeComponent, Vflow } from 'ngx-vflow';
import { FlowStoreService } from '../services/flow-store.service';

@Component({
  template: `
    <div class="output-node">
      <div class="node-header">
        <svg class="icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.5" fill="none" />
          <circle cx="8" cy="8" r="2" fill="currentColor" />
        </svg>
        <span class="title">Output</span>
      </div>
      <div class="node-content">
        <div class="metric-group">
          <div class="metric-label">Size</div>
          <div class="metric-row">
            <span class="metric-name">W:</span>
            <span class="metric-value">{{ connectedNodeWidth() }}px</span>
            <handle position="left" type="target" id="width" />
          </div>
          <div class="metric-row">
            <span class="metric-name">H:</span>
            <span class="metric-value">{{ connectedNodeHeight() }}px</span>
            <handle position="left" type="target" id="height" />
          </div>
        </div>

        <div class="divider"></div>

        <div class="metric-group">
          <div class="metric-label">Position</div>
          <div class="metric-row">
            <span class="metric-name">X:</span>
            <span class="metric-value">{{ connectedNodeX() }}</span>
            <handle position="left" type="target" id="x" />
          </div>
          <div class="metric-row">
            <span class="metric-name">Y:</span>
            <span class="metric-value">{{ connectedNodeY() }}</span>
            <handle position="left" type="target" id="y" />
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        --node-bg: #fafafa;
        --node-border: #e4e4e7;
        --accent-slate: #64748b;
        --text-primary: #18181b;
        --text-muted: #71717a;
      }

      .output-node {
        width: 180px;
        background: white;
        border: 2px solid var(--accent-slate);
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
        border-bottom: 2px solid var(--accent-slate);
        color: var(--accent-slate);
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
        display: flex;
        flex-direction: column;
        gap: 8px;
        background: white;
      }

      .metric-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .metric-label {
        font-size: 11px;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .metric-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 8px;
        background: rgba(0, 0, 0, 0.02);
        border-radius: 4px;
        font-size: 12px;
      }

      .metric-name {
        color: var(--text-muted);
        font-weight: 600;
        min-width: 16px;
      }

      .metric-value {
        color: var(--text-primary);
        font-family: 'Monaco', 'Courier New', monospace;
        font-weight: 500;
      }

      .divider {
        height: 1px;
        background: var(--node-border);
        margin: 4px 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow],
})
export class OutputNodeComponent extends CustomNodeComponent {
  public store = inject(FlowStoreService);

  public connectedNodeWidth = computed(() => {
    const edge =
      this.store.edges().find((edge) => edge.target === this.node().id && edge.targetHandle === 'width') ?? null;
    const sourceNode = edge ? this.store.nodes().find((node) => node.id === edge?.source) : null;
    return Math.floor(sourceNode?.width?.() ?? 0);
  });

  public connectedNodeHeight = computed(() => {
    const edge =
      this.store.edges().find((edge) => edge.target === this.node().id && edge.targetHandle === 'height') ?? null;
    const sourceNode = edge ? this.store.nodes().find((node) => node.id === edge?.source) : null;
    return Math.floor(sourceNode?.height?.() ?? 0);
  });

  public connectedNodeX = computed(() => {
    const edge = this.store.edges().find((edge) => edge.target === this.node().id && edge.targetHandle === 'x') ?? null;
    const sourceNode = edge ? this.store.nodes().find((node) => node.id === edge?.source) : null;
    return Math.floor(sourceNode?.point().x ?? 0);
  });

  public connectedNodeY = computed(() => {
    const edge = this.store.edges().find((edge) => edge.target === this.node().id && edge.targetHandle === 'y') ?? null;
    const sourceNode = edge ? this.store.nodes().find((node) => node.id === edge?.source) : null;
    return Math.floor(sourceNode?.point().y ?? 0);
  });
}
