import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VflowComponent } from '../vflow/vflow.component';
import { Background } from '../../types/background.type';

@Component({
  template: `<vflow
    style="--v-background-pattern: rgb(1, 2, 3); width: 400px; height: 300px"
    [nodes]="[]"
    [background]="background()" />`,
  imports: [VflowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class BackgroundHostComponent {
  public readonly background = signal<Background>({ type: 'grid' });
}

describe('Background pattern', () => {
  function render(background: Background) {
    const fixture = TestBed.createComponent(BackgroundHostComponent);
    fixture.componentInstance.background.set(background);
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  it('strokes the grid lines without filling the cells', () => {
    const line = render({ type: 'grid' }).querySelector('[data-v-background-pattern]')!;
    const style = getComputedStyle(line);

    expect(line.tagName).toBe('path');
    expect(style.fill).toBe('none');
    expect(style.stroke).toBe('rgb(1, 2, 3)');
  });

  it('fills the dots without a stroke around them', () => {
    const dot = render({ type: 'dots' }).querySelector('[data-v-background-pattern]')!;
    const style = getComputedStyle(dot);

    expect(dot.tagName).toBe('circle');
    expect(style.fill).toBe('rgb(1, 2, 3)');
    expect(style.stroke).toBe('none');
  });

  it('draws nothing for an image that does not load, and keeps following the viewport', async () => {
    const fixture = TestBed.createComponent(BackgroundHostComponent);
    fixture.componentInstance.background.set({ type: 'image', src: 'data:image/png;base64,broken' });
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 50));
    await fixture.whenStable();

    const flow = fixture.debugElement.children[0].componentInstance as VflowComponent;
    await flow.setViewport({ x: 30, y: 20, zoom: 2 });
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.nativeElement.querySelector('[data-v-background-pattern]')).toBeNull();
  });
});
