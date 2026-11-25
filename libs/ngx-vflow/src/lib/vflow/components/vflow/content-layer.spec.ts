import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
  let fixture: ComponentFixture<HostComponent>;
  let root: HTMLElement;
  let element: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(HostComponent);
    document.body.append(fixture.nativeElement);
    fixture.detectChanges();
    await new Promise<void>((resolve) => fixture.componentInstance.flow().initialized.subscribe(() => resolve()));
    root = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[data-v-root]')!;
    element = root.querySelector<HTMLElement>('app-zoom-button')!;
  });

  afterEach(() => {
    fixture.destroy();
    fixture.nativeElement.remove();
  });

  it('gives an element of the content the flow it is placed in', () => {
    expect(fixture.componentInstance.button().flow).toBe(fixture.componentInstance.flow());
  });

  it('positions an element of the content against the flow', () => {
    const flowRect = root.getBoundingClientRect();
    const rect = element.getBoundingClientRect();

    expect(rect.left - flowRect.left).toBeCloseTo(10, 0);
    expect(flowRect.bottom - rect.bottom).toBeCloseTo(10, 0);
  });

  it('renders an element of the content above the pane, where it takes the pointer', () => {
    const rect = element.getBoundingClientRect();

    expect(document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)).toBe(
      element.querySelector('button'),
    );
  });

  it('leaves the pointer to the pane outside the elements of the content', () => {
    const flowRect = root.getBoundingClientRect();

    expect(document.elementFromPoint(flowRect.right - 20, flowRect.top + 20)?.closest('.v-pane')).not.toBeNull();
  });

  it('lets an element of the content drive the flow', () => {
    element.querySelector('button')!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.flow().viewport().zoom).toBeGreaterThan(1);
  });
});
