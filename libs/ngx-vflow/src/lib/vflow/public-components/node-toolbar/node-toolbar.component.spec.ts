import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VflowComponent } from '../../components/vflow/vflow.component';
import { createNode } from '../../interfaces/node.interface';
import { Position } from '../../types/position.type';
import { NodeToolbarComponent } from './node-toolbar.component';

const toolbarPosition = signal<Position | null>(null);

/** A presentation that declares its toolbar conditionally, as a selection-driven toolbar does. */
@Component({
  template: `<div class="box" style="width: 100px; height: 50px; position: relative">
    Node
    @if (toolbarPosition(); as position) {
      <node-toolbar [position]="position"
        ><button class="tool" style="display: block; width: 30px; height: 20px; margin: 0; padding: 0; border: 0">
          Tool
        </button></node-toolbar
      >
    }
  </div>`,
  imports: [NodeToolbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ToolbarNodeComponent {
  protected toolbarPosition = toolbarPosition;
}

describe('NodeToolbarComponent', () => {
  let fixture: ComponentFixture<VflowComponent>;

  beforeEach(async () => {
    toolbarPosition.set(null);
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    fixture = TestBed.createComponent(VflowComponent);
    fixture.componentRef.setInput('view', [400, 300]);
    fixture.componentRef.setInput('nodes', [
      createNode({ id: 'node', component: ToolbarNodeComponent, point: { x: 20, y: 30 } }),
    ]);
    fixture.detectChanges();
    for (let i = 0; i < 5; i++) await new Promise(requestAnimationFrame);
    await fixture.whenStable();
  });

  const toolbar = () => fixture.nativeElement.querySelector('node-toolbar') as HTMLElement | null;
  const box = () => (fixture.nativeElement.querySelector('.box') as HTMLElement).getBoundingClientRect();

  it('renders inside the node in the same change detection pass as the presentation that declares it', () => {
    expect(toolbar()).toBeNull();

    toolbarPosition.set('top');
    fixture.detectChanges();

    const host = toolbar();
    expect(host).not.toBeNull();
    expect(host!.querySelector('.tool')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.vflow-node')!.contains(host)).toBeTrue();
    // Gestures inside the toolbar must not drag the node.
    expect(host!.hasAttribute('data-vflow-no-drag')).toBeTrue();

    toolbarPosition.set(null);
    fixture.detectChanges();

    expect(toolbar()).toBeNull();
  });

  it('hangs 10px outside the chosen side, centered along it', () => {
    const expectations: Record<Position, (node: DOMRect, bar: DOMRect) => void> = {
      top: (node, bar) => {
        expect(node.top - bar.bottom).toBeCloseTo(10, 1);
        expect(bar.left + bar.width / 2).toBeCloseTo(node.left + node.width / 2, 1);
      },
      bottom: (node, bar) => {
        expect(bar.top - node.bottom).toBeCloseTo(10, 1);
        expect(bar.left + bar.width / 2).toBeCloseTo(node.left + node.width / 2, 1);
      },
      left: (node, bar) => {
        expect(node.left - bar.right).toBeCloseTo(10, 1);
        expect(bar.top + bar.height / 2).toBeCloseTo(node.top + node.height / 2, 1);
      },
      right: (node, bar) => {
        expect(bar.left - node.right).toBeCloseTo(10, 1);
        expect(bar.top + bar.height / 2).toBeCloseTo(node.top + node.height / 2, 1);
      },
    };

    for (const position of Object.keys(expectations) as Position[]) {
      toolbarPosition.set(position);
      fixture.detectChanges();

      const bar = toolbar()!.getBoundingClientRect();
      expect(bar.width).toBe(30);
      expect(bar.height).toBe(20);
      expectations[position](box(), bar);
    }
  });
});
