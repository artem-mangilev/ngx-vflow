import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { AriaLabelConfig, Vflow, createEdges, createNodes } from 'ngx-vflow';

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section data-testid="accessibility-demo" aria-label="Accessibility example">
      <div class="controls">
        <label
          ><input type="checkbox" [checked]="canAccept()" (change)="canAccept.set(!canAccept())" /> Allow incoming
          connections</label
        >
        <label
          ><input type="checkbox" [checked]="valid()" (change)="valid.set(!valid())" /> Connection passes
          validation</label
        >
        <button type="button" (click)="russian.set(!russian())">Switch graph language</button>
      </div>
      <p>
        Reviews: {{ reviews() }}. Accepted connections: {{ connections() }}. Completed connection attempts:
        {{ attempts() }}.
      </p>
      <vflow
        [nodes]="nodes"
        [edges]="edges"
        [view]="[600, 300]"
        [ariaLabelConfig]="labels()"
        [connection]="connection"
        (connect)="connections.set(connections() + 1)"
        (connectEnd)="attempts.set(attempts() + 1)">
        <mini-map />
        <ng-template nodeHtml>
          <div class="reviewer">
            <button type="button" noDrag noPan (click)="reviews.set(reviews() + 1)">Review request</button>
            <handle
              type="target"
              position="left"
              id="incoming"
              ariaLabel="Accept request"
              ariaDescription="Inbound route."
              [canStart]="false"
              [canAccept]="canAccept()" />
          </div>
        </ng-template>
        <ng-template let-ctx edge>
          <svg:g customTemplateEdge selectable>
            <svg:path aria-hidden="true" fill="none" stroke="#345" stroke-width="2" [attr.d]="ctx.path()" />
          </svg:g>
        </ng-template>
      </vflow>
      <vflow [nodes]="referenceNodes" [view]="[600, 120]" [ariaLabelConfig]="{ flowLabel: 'Reference graph' }" />
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
    section {
      background: white;
      color: #1b262c;
      padding: 12px;
      overflow: auto;
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
    }
    label {
      display: flex;
      gap: 6px;
      align-items: center;
    }
    button {
      background: #fff;
      color: #1b262c;
      border: 1px solid #345;
      border-radius: 4px;
      padding: 8px;
    }
    button:focus-visible,
    input:focus-visible {
      outline: 3px solid #005fcc;
      outline-offset: 2px;
    }
    .reviewer {
      position: relative;
      padding: 14px;
      border: 2px solid #345;
      border-radius: 6px;
    }
  `,
})
export class AccessibilityDemoComponent {
  protected canAccept = signal(true);
  protected valid = signal(true);
  protected russian = signal(false);
  protected reviews = signal(0);
  protected attempts = signal(0);
  protected connections = signal(0);
  protected connection = { validator: () => this.valid() };
  protected labels = computed<Partial<AriaLabelConfig>>(() =>
    this.russian()
      ? {
          flowLabel: 'Граф проверки',
          flowDescription: 'Заявка и её проверка.',
          minimapLabel: 'Мини-карта графа',
          nodeLabel: (id) => `Узел ${id}`,
          groupLabel: (id) => `Группа ${id}`,
          edgeLabel: ({ source, target }) => `Связь от ${source} к ${target}`,
          handleLabel: ({ type, id, node }) =>
            `${type === 'source' ? 'Исходящая' : 'Входящая'} точка соединения${id ? ` ${id}` : ''} узла ${node}`,
          parentDescription: (parent) => `Родитель: ${parent}.`,
          selected: 'Выбран.',
          selectionUnavailable: 'Выбор недоступен.',
          movementUnavailable: 'Перемещение недоступно.',
          reconnectionUnavailable: 'Переподключение недоступно.',
          connectionStartUnavailable: 'Начало соединения недоступно.',
          connectionAcceptUnavailable: 'Приём соединения недоступен.',
          connectionValid: 'Допустимая цель соединения.',
          connectionInvalid: 'Недопустимая цель соединения.',
        }
      : { flowLabel: 'Review graph', flowDescription: 'Request and its review.' },
  );
  protected nodes = createNodes([
    {
      id: 'parent',
      type: 'default-group',
      point: { x: 10, y: 20 },
      width: 250,
      height: 180,
      ariaLabel: 'Review',
      color: '#64748b',
      resizable: true,
    },
    {
      id: 'request',
      type: 'default',
      point: { x: 40, y: 55 },
      parentId: 'parent',
      text: '<b>Request</b>',
      selected: true,
      selectable: false,
      draggable: false,
      ariaDescription: 'Needs approval.',
    },
    { id: 'approval', type: 'html-template', point: { x: 340, y: 70 }, ariaLabel: 'Approval', selectable: false },
    { id: 'archive', type: 'default', point: { x: 340, y: 210 }, text: 'Archive' },
  ]);
  protected edges = createEdges([
    { id: 'review', source: 'request', target: 'approval', targetHandle: 'incoming' },
    {
      id: 'archive',
      source: 'request',
      target: 'archive',
      type: 'template',
      ariaLabel: 'Archive route',
      ariaDescription: 'Keep a copy.',
      selected: true,
      selectable: false,
    },
  ]);
  protected referenceNodes = createNodes([
    { id: 'parent', type: 'default', point: { x: 20, y: 20 }, text: 'Reference' },
    { id: 'request', type: 'default', point: { x: 220, y: 20 }, text: 'Copy', parentId: 'parent', extent: null },
  ]);
}
