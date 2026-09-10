import { reflectComponentType } from '@angular/core';
import { MiniMapMockComponent, ResizableMockComponent, VflowMockComponent } from 'ngx-vflow/testing';
import { VflowComponent } from './vflow.component';
import { MiniMapComponent } from '../../public-components/minimap/minimap.component';
import { ResizableComponent } from '../../public-components/resizable/resizable.component';
import { NodeResizeControlComponent } from '../../public-components/resizable/node-resize-control.component';
import { Background } from '../../types/background.type';
import { Marker } from '../../interfaces/marker.interface';
import { DefaultEdgeLabel } from '../../interfaces/edge-label.interface';
import { DefaultGroupNode } from '../../interfaces/node.interface';
import { SelectionBoxSettings } from '../../interfaces/selection-box-settings.interface';
import { AlignmentHelperSettings } from '../../interfaces/alignment-helper-settings.interface';

// Compile-time negative checks: obsolete fields must not be accepted-but-ignored.
function accepts<T>(value: T): void {
  void value;
}

describe('CSS-only appearance API', () => {
  it('removes styling inputs from production components and matching mocks', () => {
    for (const component of [
      MiniMapComponent,
      MiniMapMockComponent,
      ResizableComponent,
      ResizableMockComponent,
      NodeResizeControlComponent,
      VflowComponent,
      VflowMockComponent,
    ]) {
      const names = reflectComponentType<unknown>(component)?.inputs.map((input) => input.templateName);
      for (const removed of ['resizerColor', 'color', 'maskColor', 'strokeColor', 'lineColor']) {
        expect(names).not.toContain(removed);
      }
    }
  });

  it('rejects obsolete appearance fields at compile time', () => {
    // @ts-expect-error Colors are CSS, not a background shorthand.
    accepts<Background>('#fff');
    // @ts-expect-error Solid background color is CSS.
    accepts<Background>({ type: 'solid', color: '#fff' });
    // @ts-expect-error Dot diameter is CSS; gap remains geometry.
    accepts<Background>({ type: 'dots', size: 4 });
    // @ts-expect-error Grid stroke width is CSS; cell size remains geometry.
    accepts<Background>({ type: 'grid', strokeWidth: 2 });
    // @ts-expect-error Selection appearance is CSS.
    accepts<SelectionBoxSettings>({ color: 'red' });
    // @ts-expect-error Alignment appearance is CSS.
    accepts<AlignmentHelperSettings>({ tolerance: 10, lineColor: 'red' });
    // @ts-expect-error Marker color is CSS.
    accepts<Marker>({ color: 'red' });
    // @ts-expect-error Marker visual size is CSS.
    accepts<Marker>({ width: 30, height: 30 });
    // @ts-expect-error Marker stroke width is CSS.
    accepts<Marker>({ strokeWidth: 4 });
    // @ts-expect-error Default label appearance is CSS or application HTML.
    accepts<DefaultEdgeLabel>({ type: 'default', text: 'Label', style: { color: 'red' } });
    // @ts-expect-error Default group color is no longer a model field.
    accepts<Pick<DefaultGroupNode, 'color'>>({});

    accepts<Background>({ type: 'dots', gap: 25 });
    accepts<Background>({ type: 'grid', size: 25 });
    accepts<Background>({ type: 'image', src: 'image.svg', scale: 0.5, repeat: true, fixed: true });
    expect(accepts<Marker>({ type: 'arrow', orient: 'auto', markerUnits: 'strokeWidth' })).toBeUndefined();
  });
});
