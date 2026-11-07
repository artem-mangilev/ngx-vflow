import { ChangeDetectionStrategy, Component, Directive, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createNodes } from '../../interfaces/node.interface';
import { VFLOW_INITIALIZATION_GATE, VflowInitializationGate } from '../../interfaces/initialization-gate.interface';
import { Vflow } from '../../vflow';
import { VflowComponent } from './vflow.component';

/** A directive on the flow that holds its initialization until the test opens it. */
@Directive({
  selector: 'vflow[gate]',
  providers: [{ provide: VFLOW_INITIALIZATION_GATE, useExisting: GateDirective }],
})
class GateDirective implements VflowInitializationGate {
  public ready: (() => void) | null = null;

  public onMeasured(ready: () => void): void {
    this.ready = ready;
  }
}

@Component({
  template: `
    <vflow gate [view]="[400, 300]" [nodes]="nodes" (initialized)="initializations = initializations + 1">
      <div *vNode class="card"></div>
    </vflow>
  `,
  styles: `
    .card {
      width: 100px;
      height: 50px;
    }
  `,
  imports: [Vflow, GateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class GatedHostComponent {
  public readonly vflow = viewChild.required(VflowComponent);
  public readonly gate = viewChild.required(GateDirective);
  public readonly nodes = createNodes([{ id: 'a', point: { x: 0, y: 0 } }]);
  public initializations = 0;
}

async function settle(fixture: { detectChanges(): void; whenStable(): Promise<unknown> }) {
  fixture.detectChanges();
  for (let i = 0; i < 5; i++) await new Promise(requestAnimationFrame);
  await fixture.whenStable();
  fixture.detectChanges();
}

describe('initialization gates', () => {
  it('keeps the measured flow unpainted and uninitialized until the gate on its element opens', async () => {
    TestBed.configureTestingModule({ imports: [GatedHostComponent] });
    const fixture = TestBed.createComponent(GatedHostComponent);
    await settle(fixture);
    const host = fixture.componentInstance;
    const root = fixture.nativeElement.querySelector('vflow') as HTMLElement;

    expect(host.gate().ready).not.toBeNull();
    expect(host.vflow().getNodeRect('a')).toEqual({ x: 0, y: 0, width: 100, height: 50 });
    expect(host.initializations).toBe(0);
    expect(root.classList.contains('v-initializing')).toBe(true);

    host.gate().ready!();
    await settle(fixture);

    expect(host.initializations).toBe(1);
    expect(root.classList.contains('v-initializing')).toBe(false);

    // A second call changes nothing.
    host.gate().ready!();
    await settle(fixture);
    expect(host.initializations).toBe(1);
    expect(root.classList.contains('v-initializing')).toBe(false);
  });
});
