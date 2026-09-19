import { ChangeDetectionStrategy, Component, inject, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VflowHandleDirective } from 'ngx-vflow';
import { HandleMockDirective } from './handle-mock.directive';

@Component({
  selector: 'test-handle-state',
  template: `{{ handle.type() }} {{ handle.state() }}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HandleStateComponent {
  protected readonly handle = inject(VflowHandleDirective);
}

@Component({
  template: `<span vflowHandle handleType="target"><test-handle-state /></span>`,
  imports: [VflowHandleDirective, HandleStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HandleHostComponent {}

describe('HandleMockDirective', () => {
  it('stands in for the handle directive when content injects it', () => {
    TestBed.configureTestingModule({
      imports: [HandleHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).overrideComponent(HandleHostComponent, {
      remove: { imports: [VflowHandleDirective] },
      add: { imports: [HandleMockDirective] },
    });
    const fixture = TestBed.createComponent(HandleHostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('test-handle-state').textContent.trim()).toBe('target idle');
  });
});
