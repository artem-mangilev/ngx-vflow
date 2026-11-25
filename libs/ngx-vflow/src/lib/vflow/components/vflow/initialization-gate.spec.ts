import { ChangeDetectionStrategy, Component, Directive, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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

describe('initialization gates', () => {
  let fixture: ComponentFixture<GatedHostComponent>;
  let host: GatedHostComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(GatedHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    element = fixture.nativeElement.querySelector('vflow');
    await expect.poll(() => host.gate().measured).toBe(true);
    // A flow without a gate initializes in the task that asks the gate.
    await fixture.whenStable();
  });

  it('asks the gate once the nodes are measured', () => {
    expect(host.vflow().getNodeRect('a')).toEqual({ x: 0, y: 0, width: 100, height: 50 });
  });

  it('keeps the flow uninitialized and unpainted while the gate is closed', () => {
    expect(host.initializations).toBe(0);
    expect(element.classList.contains('v-initializing')).toBe(true);
  });

  it('initializes the flow and paints it once the gate opens', async () => {
    host.gate().open();
    await expect.poll(() => host.initializations).toBe(1);
    fixture.detectChanges();

    expect(element.classList.contains('v-initializing')).toBe(false);
  });
});
