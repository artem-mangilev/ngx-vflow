import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Vflow } from '../../vflow';
import { createNodes } from '../../interfaces/node.interface';
import { VflowComponent } from './vflow.component';

/** An overlay of the application, like viewport controls: it drives the flow it is placed in. */
@Component({
  selector: 'app-zoom-button',
  template: `<button type="button" (click)="flow.zoomIn()">Zoom in</button>`,
  host: { style: 'position: absolute; left: 10px; bottom: 10px' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ZoomButtonComponent {
  readonly flow = inject(VflowComponent);
}

@Component({
  template: `<vflow style="width: 400px; height: 300px" [nodes]="nodes">
    <div *vNode style="width: 100px; height: 50px"></div>
    <app-zoom-button />
  </vflow>`,
  imports: [Vflow, ZoomButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  readonly flow = viewChild.required(VflowComponent);
  readonly button = viewChild.required(ZoomButtonComponent);
  readonly nodes = createNodes([{ id: 'a', point: { x: 0, y: 0 } }]);
}

describe('content of the flow', () => {
  it('renders an element of the content above the pane, positioned against the flow, with the flow injected', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    document.body.append(fixture.nativeElement);
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.componentInstance;
    const root = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[data-v-root]')!;
    const element = root.querySelector<HTMLElement>('app-zoom-button')!;

    expect(host.button().flow).toBe(host.flow());
    expect(element).not.toBeNull();

    const flowRect = root.getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    expect(rect.left - flowRect.left).toBeCloseTo(10, 0);
    expect(flowRect.bottom - rect.bottom).toBeCloseTo(10, 0);

    // The button takes the pointer; elsewhere the pointer reaches the pane.
    const button = element.querySelector('button')!;
    expect(document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)).toBe(button);
    expect(document.elementFromPoint(flowRect.right - 20, flowRect.top + 20)?.closest('.v-pane')).not.toBeNull();

    button.click();
    fixture.detectChanges();
    expect(host.flow().viewport().zoom).toBeGreaterThan(1);

    fixture.destroy();
    fixture.nativeElement.remove();
  });
});
