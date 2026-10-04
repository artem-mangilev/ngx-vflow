import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createNode as createRawNode } from '../interfaces/node.interface';
import { NodeModel } from '../models/node.model';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { FlowSettingsService } from '../services/flow-settings.service';
import { NodeRenderingService } from '../services/node-rendering.service';
import { FlowStatusService } from '../services/flow-status.service';
import { KeyboardService } from '../services/keyboard.service';
import { ViewportService } from '../services/viewport.service';
import { RootPointerDirective } from './root-pointer.directive';
import { SelectionBoxContextDirective } from './selection-box-context.directive';
import { SpacePointContextDirective } from './space-point-context.directive';
import { dispatchPointer } from '../gestures/pointer-events.testing';

@Component({
  template: `
    <div rootPointer>
      <div spacePointContext selectionBoxContext></div>
    </div>
  `,
  imports: [RootPointerDirective, SpacePointContextDirective, SelectionBoxContextDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SelectionBoxHostComponent {
  @ViewChild(SelectionBoxContextDirective)
  public context!: SelectionBoxContextDirective;
}

describe('SelectionBoxContextDirective', () => {
  let fixture: ComponentFixture<SelectionBoxHostComponent>;
  let entitiesService: FlowEntitiesService;
  let settingsService: FlowSettingsService;
  let selectionShortcutActive = true;

  beforeEach(() => {
    selectionShortcutActive = true;

    TestBed.configureTestingModule({
      imports: [SelectionBoxHostComponent],
      providers: [
        FlowEntitiesService,
        FlowSettingsService,
        FlowStatusService,
        { provide: KeyboardService, useValue: { isActiveModifier: () => selectionShortcutActive } },
        NodeRenderingService,
        ViewportService,
      ],
    });

    fixture = TestBed.createComponent(SelectionBoxHostComponent);
    fixture.detectChanges();
    entitiesService = TestBed.inject(FlowEntitiesService);
    settingsService = TestBed.inject(FlowSettingsService);
  });

  function createNode(id: string, selectable?: boolean) {
    return TestBed.runInInjectionContext(
      () =>
        new NodeModel(
          createRawNode({
            id,
            point: { x: 0, y: 0 },
            width: 10,
            height: 10,
            selectable,
          }),
        ),
    );
  }

  async function startSelectionBox() {
    const root = fixture.nativeElement.querySelector('[rootPointer]') as HTMLElement;
    const pane = fixture.nativeElement.querySelector('[spacePointContext]') as HTMLElement;
    pane.getBoundingClientRect = () => ({ left: 0, top: 0, x: 0, y: 0 }) as DOMRect;
    dispatchPointer(root, 'pointerdown', { x: 0, y: 0 });
    await new Promise((resolve) => setTimeout(resolve, 30));
  }

  afterEach(() => {
    fixture?.destroy();
  });

  it('should not start when the selection shortcut is disabled or selection is manual', async () => {
    const node = createNode('manual');
    node.selected.set(true);
    entitiesService.nodes.set([node]);

    selectionShortcutActive = false;
    await startSelectionBox();
    expect(fixture.componentInstance.context.model.active()).toBe(false);

    selectionShortcutActive = true;
    settingsService.selectionMode.set('manual');
    await startSelectionBox();
    expect(fixture.componentInstance.context.model.active()).toBe(false);
    expect(node.selected()).toBe(true);
  });

  it('should preselect and apply only eligible nodes', async () => {
    const ineligible = createNode('ineligible', false);
    const eligible = createNode('eligible', true);
    entitiesService.nodes.set([ineligible, eligible]);

    await startSelectionBox();
    expect(fixture.componentInstance.context.model.active()).toBe(true);
    dispatchPointer(document, 'pointermove', { x: 20, y: 20 });

    expect(fixture.componentInstance.context.model.width()).toBeGreaterThan(2);
    expect(eligible.selectable()).toBe(true);
    expect(eligible.width()).toBe(10);
    expect(ineligible.preselected()).toBe(false);
    expect(eligible.preselected()).toBe(true);

    eligible.rawNode.selectable!.set(false);

    dispatchPointer(document, 'pointerup', { x: 120, y: 120 });

    expect(ineligible.selected()).toBe(false);
    expect(eligible.selected()).toBe(true);
  });
});
