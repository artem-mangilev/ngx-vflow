import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VflowHandleDirective } from 'ngx-vflow';
import { provideCustomNodeMocks } from './provide-custom-node-mocks';

@Component({
  selector: 'test-port',
  hostDirectives: [{ directive: VflowHandleDirective, inputs: ['type', 'position', 'id'] }],
  template: `{{ handle.type() }} {{ handle.state() }}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PortComponent {
  protected readonly handle = inject(VflowHandleDirective);
}

@Component({
  template: `<test-port type="target" position="left" id="in" />`,
  imports: [PortComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ApplicationNodeComponent {}

describe('provideCustomNodeMocks', () => {
  it('runs a component that becomes a handle through hostDirectives', () => {
    TestBed.configureTestingModule({
      imports: [ApplicationNodeComponent],
      providers: [provideZonelessChangeDetection(), provideCustomNodeMocks()],
    });
    const fixture = TestBed.createComponent(ApplicationNodeComponent);
    fixture.detectChanges();
    const port = fixture.nativeElement.querySelector('test-port') as HTMLElement;

    expect(port.textContent!.trim()).toBe('target idle');
    expect(port.getAttribute('data-vflow-handle-position')).toBe('left');
  });
});
