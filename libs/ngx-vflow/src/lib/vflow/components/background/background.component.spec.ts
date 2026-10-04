import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VflowComponent } from '../vflow/vflow.component';
import { Background } from '../../types/background.type';

@Component({
  template: `<vflow style="--v-muted: rgb(1, 2, 3)" [view]="[400, 300]" [nodes]="[]" [background]="background()" />`,
  imports: [VflowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class BackgroundHostComponent {
  public readonly background = signal<Background>({ type: 'grid' });
}

describe('Background pattern', () => {
  function render(background: Background) {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(BackgroundHostComponent);
    fixture.componentInstance.background.set(background);
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  it('strokes the grid lines without filling the cells', () => {
    const line = render({ type: 'grid' }).querySelector('.v-background-pattern')!;
    const style = getComputedStyle(line);

    expect(line.tagName).toBe('path');
    expect(style.fill).toBe('none');
    expect(style.stroke).toBe('rgb(1, 2, 3)');
  });

  it('fills the dots without a stroke around them', () => {
    const dot = render({ type: 'dots' }).querySelector('.v-background-pattern')!;
    const style = getComputedStyle(dot);

    expect(dot.tagName).toBe('circle');
    expect(style.fill).toBe('rgb(1, 2, 3)');
    expect(style.stroke).toBe('none');
  });
});
