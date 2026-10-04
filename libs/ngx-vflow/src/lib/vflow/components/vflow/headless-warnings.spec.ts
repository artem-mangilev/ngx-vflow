import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createNodes } from '../../interfaces/node.interface';
import { Edge, createEdges } from '../../interfaces/edge.interface';
import { Vflow } from '../../vflow';
import { injectEdge } from '../../utils/inject-edge';

const nodes = () =>
  createNodes([
    { id: 'a', point: { x: 0, y: 0 } },
    { id: 'b', point: { x: 200, y: 0 } },
    { id: 'c', point: { x: 200, y: 100 } },
  ]);

const NODE_TEMPLATE = `
  <ng-template vNode>
    <div style="width: 60px; height: 30px">
      <span vHandle handleType="target" position="left"></span
      ><span vHandle handleType="source" position="right"></span>
    </div>
  </ng-template>
`;

@Component({
  template: `<svg:path fill="none" [attr.d]="ctx.path()" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ComponentEdge {
  readonly ctx = injectEdge();
}

@Component({
  template: `<vflow [view]="[500, 300]" [nodes]="nodes" [edges]="edges()">${NODE_TEMPLATE}</vflow>`,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class NoEdgeTemplateHostComponent {
  readonly nodes = nodes();
  readonly edges = signal<Edge[]>(
    createEdges([
      { id: 'a-b', source: 'a', target: 'b' },
      { id: 'a-c', source: 'a', target: 'c' },
    ]),
  );
}

@Component({
  template: `<vflow [view]="[500, 300]" [nodes]="nodes" [edges]="edges">
    ${NODE_TEMPLATE}
    <ng-template let-ctx vEdge>
      <svg:path fill="none" [attr.d]="ctx.path()" />
    </ng-template>
  </vflow>`,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class EdgeTemplateHostComponent {
  readonly nodes = nodes();
  readonly edges = createEdges([{ id: 'a-b', source: 'a', target: 'b' }]);
}

@Component({
  template: `<vflow [view]="[500, 300]" [nodes]="nodes" [edges]="edges">
    <ng-template vNode>
      <div vSelectable style="width: 60px; height: 30px">
        <span vHandle handleType="target" position="left"></span
        ><span vHandle handleType="source" position="right"></span>
      </div>
    </ng-template>
    <ng-template let-ctx vEdge>
      <svg:path vSelectable fill="none" [attr.d]="ctx.path()" />
    </ng-template>
  </vflow>`,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SelectableEdgeHostComponent {
  readonly nodes = nodes();
  readonly edges = createEdges([
    { id: 'a-b', source: 'a', target: 'b' },
    { id: 'a-c', source: 'a', target: 'c' },
  ]);
}

describe('headless dev warnings', () => {
  let warn: jasmine.Spy;

  async function render<T>(host: new () => T, setup?: (instance: T) => void) {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(host);
    setup?.(fixture.componentInstance);
    await settle(fixture);
    return fixture;
  }

  async function settle(fixture: { detectChanges(): void; whenStable(): Promise<unknown> }) {
    fixture.detectChanges();
    for (let i = 0; i < 5; i++) await new Promise(requestAnimationFrame);
    await fixture.whenStable();
  }

  const warnings = (text: string) => warn.calls.allArgs().filter(([message]) => String(message).includes(text));

  beforeEach(() => {
    warn = spyOn(console, 'warn');
  });

  describe('edge without a presentation', () => {
    const NO_PRESENTATION = 'declares no <ng-template vEdge>';

    it('warns once per flow, however many edges lack a component', async () => {
      const fixture = await render(NoEdgeTemplateHostComponent);

      expect(warnings(NO_PRESENTATION).length).toBe(1);
      expect(warnings(NO_PRESENTATION)[0][0]).toContain('[ngx-vflow] Edge "a-b"');

      fixture.componentInstance.edges.update((edges) => [...edges, { id: 'b-c', source: 'b', target: 'c' }]);
      await settle(fixture);

      expect(warnings(NO_PRESENTATION).length).toBe(1);
    });

    it('warns again when the edge it names is gone and another one lacks a component', async () => {
      const fixture = await render(NoEdgeTemplateHostComponent);

      fixture.componentInstance.edges.update((edges) => edges.slice(1));
      await settle(fixture);

      expect(warnings(NO_PRESENTATION).map(([message]) => /Edge "(.+?)"/.exec(message)?.[1])).toEqual(['a-b', 'a-c']);
    });

    it('stays silent when every edge has a component', async () => {
      await render(NoEdgeTemplateHostComponent, ({ edges }) =>
        edges.set([{ id: 'a-b', source: 'a', target: 'b', component: ComponentEdge }]),
      );

      expect(warnings(NO_PRESENTATION).length).toBe(0);
    });

    it('stays silent when the flow declares an edge template', async () => {
      await render(EdgeTemplateHostComponent);

      expect(warnings(NO_PRESENTATION).length).toBe(0);
    });

    it('stays silent outside dev mode', async () => {
      const scope = globalThis as { ngDevMode?: unknown };
      const devMode = scope.ngDevMode;
      scope.ngDevMode = false;
      try {
        await render(NoEdgeTemplateHostComponent);
      } finally {
        scope.ngDevMode = devMode;
      }

      expect(warnings(NO_PRESENTATION).length).toBe(0);
    });
  });

  describe('[vSelectable] outside a node presentation', () => {
    const NO_EFFECT = '[vSelectable] has no effect outside a node presentation';

    it('warns for every edge of the template and stays silent for the node template', async () => {
      await render(SelectableEdgeHostComponent);

      expect(warnings(NO_EFFECT).length).toBe(2);
    });

    it('stays silent outside dev mode', async () => {
      const scope = globalThis as { ngDevMode?: unknown };
      const devMode = scope.ngDevMode;
      scope.ngDevMode = false;
      try {
        await render(SelectableEdgeHostComponent);
      } finally {
        scope.ngDevMode = devMode;
      }

      expect(warnings(NO_EFFECT).length).toBe(0);
    });
  });
});
