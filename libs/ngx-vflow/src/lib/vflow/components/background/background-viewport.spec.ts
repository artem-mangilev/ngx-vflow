import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VflowComponent } from '../vflow/vflow.component';
import { Background } from '../../types/background.type';

/** An image of 200 x 100 pixels. */
const IMAGE = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"></svg>`,
)}`;

@Component({
  template: `<vflow style="width: 400px; height: 300px" [nodes]="[]" [background]="background()" />`,
  imports: [VflowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class BackgroundHostComponent {
  readonly flow = viewChild.required(VflowComponent);
  readonly background = signal<Background | null>(null);
}

describe('background', () => {
  let fixture: ComponentFixture<BackgroundHostComponent>;
  let root: HTMLElement;

  async function render(background: Background | null, viewport = { x: 0, y: 0, zoom: 1 }) {
    fixture = TestBed.createComponent(BackgroundHostComponent);
    fixture.componentInstance.background.set(background);
    root = fixture.nativeElement;
    fixture.detectChanges();
    await fixture.componentInstance.flow().setViewport(viewport);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  const attributes = (element: Element | null, names: string[]) => names.map((name) => element?.getAttribute(name));
  const pattern = () => root.querySelector('.v-background-svg pattern');

  it.each<[string, Background]>([
    ['grid', { type: 'grid', gap: 30 }],
    ['dots', { type: 'dots', gap: 30 }],
  ])('scales the %s tile with the zoom and offsets it by the pan', async (_, background) => {
    await render(background, { x: 70, y: -20, zoom: 2 });

    // The tile is 30 * 2 = 60 wide; 70 % 60 = 10 and -20 % 60 = -20.
    expect(attributes(pattern(), ['width', 'height', 'x', 'y'])).toEqual(['60', '60', '10', '-20']);
  });

  it('scales the dot size with the zoom', async () => {
    await render({ type: 'dots', size: 4 }, { x: 0, y: 0, zoom: 2 });

    expect(root.querySelector('circle[data-v-background-pattern]')!.getAttribute('r')).toBe('4');
  });

  it('scales the grid line width with the zoom', async () => {
    await render({ type: 'grid', strokeWidth: 4 }, { x: 0, y: 0, zoom: 2 });

    expect(root.querySelector('path[data-v-background-pattern]')!.getAttribute('stroke-width')).toBe('4');
  });

  it('follows a pan of the viewport after the first render', async () => {
    await render({ type: 'grid', gap: 20 });

    await fixture.componentInstance.flow().setViewport({ x: 25, y: 5, zoom: 1 });
    fixture.detectChanges();

    expect(attributes(pattern(), ['x', 'y'])).toEqual(['5', '5']);
  });

  it('repeats a loaded image at its natural size times the scale and the zoom', async () => {
    await render({ type: 'image', src: IMAGE, scale: 0.5 }, { x: 0, y: 0, zoom: 2 });

    await expect
      .poll(() => attributes(root.querySelector('pattern image'), ['href', 'width', 'height']))
      .toEqual([IMAGE, '200', '100']);
  });

  it('keeps a fixed image at its scaled size and in the corner, whatever the viewport', async () => {
    await render({ type: 'image', src: IMAGE, scale: 0.5, fixed: true, repeat: false }, { x: 40, y: 30, zoom: 2 });

    await expect
      .poll(() => attributes(root.querySelector('.v-background-svg image'), ['x', 'y', 'width', 'height']))
      .toEqual(['0', '0', '100', '50']);
  });

  it('draws nothing without a background', async () => {
    await render(null);

    expect(root.querySelector('.v-background-svg [background]')!.children).toHaveLength(0);
  });

  it('removes the pattern when the background becomes null', async () => {
    await render({ type: 'dots' });

    fixture.componentInstance.background.set(null);
    fixture.detectChanges();

    expect(pattern()).toBeNull();
  });
});
