import {
  ChangeDetectionStrategy,
  Component,
  provideExperimentalZonelessChangeDetection,
  reflectComponentType,
  signal,
  viewChild,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResizableMockComponent } from 'ngx-vflow/testing';
import { firstValueFrom } from 'rxjs';
import { createNodes } from '../../interfaces/node.interface';
import { VflowComponent } from '../../components/vflow/vflow.component';
import { Vflow } from '../../vflow';
import { ResizableComponent } from './resizable.component';

@Component({
  template: `
    <vflow [view]="[400, 300]" [nodes]="nodes">
      <ng-template nodeHtml>
        @if (useCustomGap()) {
          <div class="resizable-host" resizable [gap]="gap()"></div>
        } @else {
          <div class="resizable-host" resizable></div>
        }
      </ng-template>
    </vflow>
  `,
  styles: `
    :host {
      display: block;
      width: 400px;
      height: 300px;
    }

    .resizable-host {
      width: 100px;
      height: 80px;
    }
  `,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ResizableTestHostComponent {
  public readonly vflow = viewChild.required(VflowComponent);
  public readonly gap = signal(4);
  public readonly useCustomGap = signal(true);
  public readonly nodes = createNodes([{ id: 'node', type: 'html-template', point: { x: 50, y: 50 } }]);
}

function center(element: Element) {
  const rect = element.getBoundingClientRect();

  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function expectCloseTo(actual: number, expected: number) {
  expect(actual).toBeCloseTo(expected, 1);
}

async function createFixture(useCustomGap = true) {
  TestBed.configureTestingModule({
    imports: [ResizableTestHostComponent],
    providers: [provideExperimentalZonelessChangeDetection()],
  });

  const fixture = TestBed.createComponent(ResizableTestHostComponent);
  fixture.componentInstance.useCustomGap.set(useCustomGap);
  fixture.detectChanges();
  await fixture.whenStable();

  return fixture;
}

describe('ResizableComponent', () => {
  it('exposes gap as an input in production and testing components', () => {
    const productionInputs = reflectComponentType(ResizableComponent)?.inputs;
    const testingInputs = reflectComponentType(ResizableMockComponent)?.inputs;

    expect(productionInputs).toContain(jasmine.objectContaining({ propName: 'gap', templateName: 'gap' }));
    expect(testingInputs).toContain(jasmine.objectContaining({ propName: 'gap', templateName: 'gap' }));
  });

  it('applies a custom gap to every resize line and corner handle', async () => {
    const fixture: ComponentFixture<ResizableTestHostComponent> = await createFixture();

    const host = fixture.nativeElement as HTMLElement;
    const controls = Array.from(host.querySelectorAll<HTMLElement>('.resize-control'));

    expect(controls.length).toBe(8);
    controls.forEach((control) => expect(control.style.getPropertyValue('--resizer-gap')).toBe('4px'));
  });

  it('renders controls at the default 1.5px gap', async () => {
    const fixture = await createFixture(false);

    const host = fixture.nativeElement as HTMLElement;
    const node = host.querySelector('.vflow-node')!;
    const topLeft = host.querySelector('.resize-control.handle.top.left')!;
    const nodeRect = node.getBoundingClientRect();
    const handleCenter = center(topLeft);

    expectCloseTo(nodeRect.left - handleCenter.x, 1.5);
    expectCloseTo(nodeRect.top - handleCenter.y, 1.5);
  });

  it('keeps every custom-gap control aligned at non-unit zoom with autoScale', async () => {
    const fixture = await createFixture();

    const viewportChanged = firstValueFrom(fixture.componentInstance.vflow().viewportChange$);
    fixture.componentInstance.vflow().viewportTo({ x: 0, y: 0, zoom: 0.5 });
    await viewportChanged;
    fixture.detectChanges();
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    const nodeRect = host.querySelector('.vflow-node')!.getBoundingClientRect();
    const expectedScreenGap = fixture.componentInstance.gap() * 0.5;

    const top = center(host.querySelector('.resize-control.line.top')!);
    const right = center(host.querySelector('.resize-control.line.right')!);
    const bottom = center(host.querySelector('.resize-control.line.bottom')!);
    const left = center(host.querySelector('.resize-control.line.left')!);
    const topLeft = center(host.querySelector('.resize-control.handle.top.left')!);
    const topRight = center(host.querySelector('.resize-control.handle.top.right')!);
    const bottomLeft = center(host.querySelector('.resize-control.handle.bottom.left')!);
    const bottomRight = center(host.querySelector('.resize-control.handle.bottom.right')!);

    expectCloseTo(nodeRect.top - top.y, expectedScreenGap);
    expectCloseTo(right.x - nodeRect.right, expectedScreenGap);
    expectCloseTo(bottom.y - nodeRect.bottom, expectedScreenGap);
    expectCloseTo(nodeRect.left - left.x, expectedScreenGap);

    expectCloseTo(nodeRect.left - topLeft.x, expectedScreenGap);
    expectCloseTo(nodeRect.top - topLeft.y, expectedScreenGap);
    expectCloseTo(topRight.x - nodeRect.right, expectedScreenGap);
    expectCloseTo(nodeRect.top - topRight.y, expectedScreenGap);
    expectCloseTo(nodeRect.left - bottomLeft.x, expectedScreenGap);
    expectCloseTo(bottomLeft.y - nodeRect.bottom, expectedScreenGap);
    expectCloseTo(bottomRight.x - nodeRect.right, expectedScreenGap);
    expectCloseTo(bottomRight.y - nodeRect.bottom, expectedScreenGap);

    expect(host.querySelector('.resize-control.handle')!.getBoundingClientRect().width).toBeCloseTo(6, 1);
  });
});
