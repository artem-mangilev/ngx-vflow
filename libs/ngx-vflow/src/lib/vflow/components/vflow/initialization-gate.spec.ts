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
  public measured = false;
  public open!: () => void;
  private readonly opened = new Promise<void>((resolve) => (this.open = resolve));

  public onMeasured(): Promise<void> {
    this.measured = true;
    return this.opened;
  }
}

@Component({
  template: `
    <vflow
      gate
      style="width: 400px; height: 300px"
      [nodes]="nodes"
      (initialized)="initializations = initializations + 1">
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

    expect(host.gate().measured).toBe(true);
    expect(host.vflow().getNodeRect('a')).toEqual({ x: 0, y: 0, width: 100, height: 50 });
    expect(host.initializations).toBe(0);
    expect(root.classList.contains('v-initializing')).toBe(true);

    host.gate().open();
    await settle(fixture);

    expect(host.initializations).toBe(1);
    expect(root.classList.contains('v-initializing')).toBe(false);
  });
});
