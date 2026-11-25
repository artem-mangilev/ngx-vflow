import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VflowComponent } from './vflow.component';
import { touchPointers } from '../../gestures/pointer-events.testing';

describe('--v-zoom on the flow element', () => {
  let fixture: ComponentFixture<VflowComponent>;
  let pane: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(VflowComponent);
    fixture.componentRef.setInput('nodes', []);
    Object.assign(fixture.nativeElement.style, { width: '400px', height: '300px' });
    fixture.detectChanges();
    await fixture.whenStable();
    pane = fixture.nativeElement.querySelector('.v-pane');
  });

  const zoomVariable = () => {
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).style.getPropertyValue('--v-zoom');
  };

  it('is 1 at the start', () => {
    expect(zoomVariable()).toBe('1');
  });

  it('takes the zoom a viewport method sets', async () => {
    await fixture.componentInstance.zoomTo(2);

    expect(zoomVariable()).toBe('2');
  });

  it('keeps the zoom of the start while a pinch is in progress', () => {
    touchPointers(pane, 'pointerdown', [{ x: 100 }, { x: 200 }]);
    touchPointers(pane, 'pointermove', [{ x: 50 }, { x: 250 }]);

    expect(fixture.componentInstance.viewport().zoom).toBe(2);
    expect(zoomVariable()).toBe('1');

    touchPointers(pane, 'pointerup', [{ x: 50 }, { x: 250 }]);
  });

  it('takes the zoom of the pinch once the fingers lift', () => {
    touchPointers(pane, 'pointerdown', [{ x: 100 }, { x: 200 }]);
    touchPointers(pane, 'pointermove', [{ x: 50 }, { x: 250 }]);

    touchPointers(pane, 'pointerup', [{ x: 50 }, { x: 250 }]);

    expect(zoomVariable()).toBe('2');
  });
});
