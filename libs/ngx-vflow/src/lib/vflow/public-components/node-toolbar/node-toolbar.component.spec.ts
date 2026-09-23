import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VflowComponent } from '../../components/vflow/vflow.component';
import { createNode } from '../../interfaces/node.interface';
import { NodeToolbarComponent } from './node-toolbar.component';

const showToolbar = signal(false);

/** A presentation that declares its toolbar conditionally, as a selection-driven toolbar does. */
@Component({
  template: `<div style="width: 100px; height: 50px">
    Node
    @if (showToolbar()) {
      <node-toolbar position="top"><button class="tool">Tool</button></node-toolbar>
    }
  </div>`,
  imports: [NodeToolbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ToolbarNodeComponent {
  protected showToolbar = showToolbar;
}

describe('NodeToolbarComponent', () => {
  let fixture: ComponentFixture<VflowComponent>;

  beforeEach(async () => {
    showToolbar.set(false);
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

  const toolbar = () => fixture.nativeElement.querySelector('.vflow-toolbar') as HTMLElement | null;

  it('renders the toolbar in the same change detection pass as the presentation that declares it', () => {
    expect(toolbar()).toBeNull();

    showToolbar.set(true);
    fixture.detectChanges();

    const host = toolbar();
    expect(host).not.toBeNull();
    expect(host!.querySelector('.tool')).not.toBeNull();
    // The node measures 100x50 at (20, 30): the box hangs above its top center, shifted by its own size.
    expect(host!.style.transform).toBe('translate(70px, 20px) translate(-50%, -100%)');
  });

  it('removes the toolbar and its projected content together with the declaring view', () => {
    showToolbar.set(true);
    fixture.detectChanges();
    const host = toolbar()!;
    const content = host.querySelector('.tool')!;

    showToolbar.set(false);
    fixture.detectChanges();

    expect(toolbar()).toBeNull();
    expect(fixture.nativeElement.contains(host)).toBeFalse();
    expect(fixture.nativeElement.contains(content)).toBeFalse();
  });
});
