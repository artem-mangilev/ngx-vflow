import {
  ChangeDetectionStrategy,
  Component,
  provideExperimentalZonelessChangeDetection,
  signal,
  viewChild,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Node } from '../../interfaces/node.interface';
import { Vflow } from '../../vflow';
import { VflowComponent } from './vflow.component';

@Component({
  template: `<vflow [view]="[400, 300]" [nodes]="nodes" />`,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class VflowTestHostComponent {
  public readonly vflow = viewChild.required(VflowComponent);
  public readonly parent: Node = {
    id: 'parent',
    type: 'default-group',
    point: signal({ x: 100, y: 100 }),
    width: signal(200),
    height: signal(200),
  };
  public readonly child: Node = {
    id: 'child',
    type: 'default',
    point: signal({ x: 10, y: 20 }),
    parentId: signal('parent'),
  };
  public readonly nodes = [this.parent, this.child];
}

describe('VflowComponent', () => {
  it('returns shallow node copies with snapshot node-space points in topmost-first order', async () => {
    TestBed.configureTestingModule({
      imports: [VflowTestHostComponent],
      providers: [provideExperimentalZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(VflowTestHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const { child, parent } = fixture.componentInstance;
    const hits = fixture.componentInstance.vflow().getNodesAtPoint({ x: 115, y: 125 });

    expect(hits.map(({ id }) => id)).toEqual(['child', 'parent']);
    expect(hits[0] === child).toBeFalse();
    expect(hits[0].point).toBe(child.point);
    expect(hits[0].parentId).toBe(child.parentId);
    expect(hits[0].nodeSpacePoint).toEqual({ x: 5, y: 5 });
    expect(hits[1].point).toBe(parent.point);
    expect(hits[1].nodeSpacePoint).toEqual({ x: 15, y: 25 });

    child.point.set({ x: 20, y: 30 });
    expect(hits[0].nodeSpacePoint).toEqual({ x: 5, y: 5 });

    hits[0].nodeSpacePoint.x = 999;
    expect(fixture.componentInstance.vflow().getNodesAtPoint({ x: 125, y: 135 })[0].nodeSpacePoint).toEqual({
      x: 5,
      y: 5,
    });
  });
});
