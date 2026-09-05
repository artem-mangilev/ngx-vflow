import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
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
        { provide: KeyboardService, useValue: { isActiveAction: () => selectionShortcutActive } },
        NodeRenderingService,
        ViewportService,
        provideExperimentalZonelessChangeDetection(),
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
            type: 'default',
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
    root.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 0, clientY: 0 }));
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
    expect(fixture.componentInstance.context.model.active()).toBeFalse();

    selectionShortcutActive = true;
    settingsService.selectionMode.set('manual');
    await startSelectionBox();
    expect(fixture.componentInstance.context.model.active()).toBeFalse();
    expect(node.selected()).toBeTrue();
  });

  it('should preselect and apply only eligible nodes', async () => {
    const ineligible = createNode('ineligible', false);
    const eligible = createNode('eligible', true);
    entitiesService.nodes.set([ineligible, eligible]);

    await startSelectionBox();
    expect(fixture.componentInstance.context.model.active()).toBeTrue();
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 20, clientY: 20 }));

    expect(fixture.componentInstance.context.model.width()).toBeGreaterThan(2);
    expect(eligible.selectable()).toBeTrue();
    expect(eligible.width()).toBe(10);
    expect(ineligible.preselected()).toBeFalse();
    expect(eligible.preselected()).toBeTrue();

    eligible.rawNode.selectable!.set(false);

    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 120, clientY: 120 }));

    expect(ineligible.selected()).toBeFalse();
    expect(eligible.selected()).toBeTrue();
  });
});
