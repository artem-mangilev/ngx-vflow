import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VflowComponent } from './components/vflow/vflow.component';
import { createNode } from './interfaces/node.interface';
import { FlowStatusService } from './services/flow-status.service';
import { FlowEntitiesService } from './services/flow-entities.service';

describe('Initial default handle placement', () => {
  it('positions handles before the first frame without waiting for DOM measurement', () => {
    TestBed.configureTestingModule({ providers: [provideExperimentalZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(VflowComponent);
    fixture.componentRef.setInput('view', [400, 300]);
    fixture.componentRef.setInput('nodes', [createNode({ id: 'a', type: 'default', point: { x: 0, y: 0 } })]);
    fixture.detectChanges();
    const source = fixture.nativeElement.querySelector('.handle--right') as HTMLElement;
    const target = fixture.nativeElement.querySelector('.handle--left') as HTMLElement;
    expect(source.style.top).toBe('25px');
    expect(source.style.right).toBe('0px');
    expect(target.style.top).toBe('25px');
    expect(target.style.left).toBe('0px');
  });

  it('does not rewrite unchanged handle accessibility during node movement', async () => {
    TestBed.configureTestingModule({ providers: [provideExperimentalZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(VflowComponent);
    fixture.componentRef.setInput('view', [400, 300]);
    fixture.componentRef.setInput('nodes', [createNode({ id: 'a', type: 'default', point: { x: 0, y: 0 } })]);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 40));
    const handle = fixture.nativeElement.querySelector('.handle--right') as HTMLElement;
    const attributes = spyOn(handle, 'setAttribute').and.callThrough();
    const model = fixture.debugElement.injector.get(FlowEntitiesService).nodes()[0];
    const status = fixture.debugElement.injector.get(FlowStatusService);
    status.setNodeDragStartStatus(model);
    fixture.detectChanges();
    status.setNodeDragStatus(model);
    fixture.detectChanges();
    expect(attributes.calls.allArgs().filter(([name]) => name === 'aria-label')).toEqual([]);
  });
});
