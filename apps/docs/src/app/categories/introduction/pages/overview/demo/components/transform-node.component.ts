import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { CustomNodeComponent, Node, Vflow } from 'ngx-vflow';

@Component({
  template: `
    <div class="transform-node" selectable [resizable]="selected()">
      <div class="node-header">
        <svg class="icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M2 8H8M8 8L5 5M8 8L5 11"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round" />
          <path
            d="M14 8H8M8 8L11 5M8 8L11 11"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
        <span class="title">Click to Resize</span>
      </div>
      <div class="node-content">
        <div class="section">
          <div class="section-label">Input</div>
          <div class="data-preview">You can attach handle to content inside node</div>
          <handle type="target" position="left" id="input-1" />
        </div>
        <div class="transform-indicator">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 2V10M6 10L9 7M6 10L3 7"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </div>
        <div class="section">
          <div class="section-label">Output</div>
          <div class="data-preview">You can attach handle to content inside node</div>
          <handle type="source" position="right" id="output-1" />
        </div>
      </div>
    </div>

    <node-toolbar position="top">
      <div class="toolbar-content">
        <button class="toolbar-btn" (click)="deleted.emit(node())">Delete</button>
      </div>
    </node-toolbar>
  `,
  styles: [
    `
      :host {
        display: contents;
      }

      .transform-node {
        min-width: 240px;
        min-height: 320px;
        width: 100%;
        height: 100%;
        background: white;
        border: 2px solid var(--accent-amber);
        border-radius: 8px;
        box-shadow:
          0 1px 3px rgba(0, 0, 0, 0.08),
          0 1px 2px rgba(0, 0, 0, 0.06);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .node-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 14px;
        background: white;
        border-bottom: 2px solid var(--accent-amber);
        color: var(--accent-amber);
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
        flex: 1;
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        gap: 12px;
        background: white;
      }

      .section {
        padding: 8px 10px;
        background: rgba(0, 0, 0, 0.02);
        border-radius: 6px;
        border: 1px solid var(--node-border);
      }

      .section-label {
        font-size: 11px;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 4px;
      }

      .data-preview {
        font-size: 12px;
        color: var(--text-primary);
        font-family: 'Monaco', 'Courier New', monospace;
      }

      .transform-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 8px;
        color: var(--text-muted);
        font-size: 11px;
        font-weight: 500;
      }

      .transform-text {
        font-size: 12px;
      }

      .toolbar-content {
        display: flex;
        gap: 4px;
        background: var(--node-bg);
        padding: 4px;
        border-radius: 6px;
      }

      .toolbar-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 10px;
        background: transparent;
        border: none;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        color: var(--text-primary);
        cursor: pointer;
        transition: background 0.15s ease;
      }

      .toolbar-btn:hover {
        background: rgba(0, 0, 0, 0.05);
      }

      .toolbar-btn:active {
        background: rgba(0, 0, 0, 0.08);
      }
    `,
  ],
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransformNodeComponent extends CustomNodeComponent {
  readonly deleted = output<Node>();
}
