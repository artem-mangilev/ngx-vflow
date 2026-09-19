import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VflowMocks, provideCustomNodeMocks } from 'ngx-vflow/testing';
import { injectNode } from './inject-node';

@Component({
  template: `<div resizable>{{ ctx.node.id }}<span vflowHandle handleType="source" position="right"></span></div>`,
  imports: [VflowMocks],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class IsolatedNodeComponent {
  readonly ctx = injectNode();
}

describe('provideCustomNodeMocks', () => {
  it('lets a component node that injects its node render outside of a flow', () => {
    TestBed.configureTestingModule({
      imports: [IsolatedNodeComponent],
      providers: [provideCustomNodeMocks(), provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(IsolatedNodeComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.ctx.node.id).toBe('mock');
    expect(fixture.nativeElement.textContent).toContain('mock');
  });
});
