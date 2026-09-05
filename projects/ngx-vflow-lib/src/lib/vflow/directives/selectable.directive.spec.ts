import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection, signal } from '@angular/core';
import { FlowEntity } from '../interfaces/flow-entity.interface';
import { FlowStatusService } from '../services/flow-status.service';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { FlowSettingsService } from '../services/flow-settings.service';
import { KeyboardService } from '../services/keyboard.service';
import { NodeComponent } from '../components/node/node.component';
import { SelectionService } from '../services/selection.service';
import { SelectableDirective } from './selectable.directive';

@Component({
  template: '<button selectable>select</button>',
  imports: [SelectableDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SelectableHostComponent {}

describe('SelectableDirective', () => {
  let fixture: ComponentFixture<SelectableHostComponent>;
  let entity: FlowEntity;

  beforeEach(() => {
    entity = {
      selected: signal(false),
      preselected: signal(false),
      selectable: signal(true),
      focusable: signal(true),
      shouldLoad: signal(true),
    };

    TestBed.configureTestingModule({
      imports: [SelectableHostComponent],
      providers: [
        FlowEntitiesService,
        FlowSettingsService,
        FlowStatusService,
        KeyboardService,
        SelectionService,
        { provide: NodeComponent, useValue: { model: () => entity } },
        provideExperimentalZonelessChangeDetection(),
      ],
    });

    fixture = TestBed.createComponent(SelectableHostComponent);
    fixture.detectChanges();
  });

  it('should ignore the DOM selection trigger when the entity is ineligible', () => {
    entity.selectable = signal(false);

    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();

    expect(entity.selected()).toBeFalse();
  });

  it('should select the entity when the DOM selection trigger is eligible', () => {
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();

    expect(entity.selected()).toBeTrue();
  });
});
