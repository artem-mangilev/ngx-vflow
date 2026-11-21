import { Subject, asyncScheduler } from 'rxjs';
import { batchChanges } from './batch-changes';

describe('batchChanges', () => {
  afterEach(() => vi.restoreAllMocks());

  it('delivers the changes of one pass as one array and releases each delivered batch', async () => {
    const schedule = vi.spyOn(asyncScheduler, 'schedule');
    const source = new Subject<number[]>();
    const delivered: number[][] = [];
    const subscription = source.pipe(batchChanges()).subscribe((changes) => delivered.push(changes));

    for (let pass = 0; pass < 3; pass++) {
      source.next([pass]);
      source.next([pass + 10]);
      await new Promise((resolve) => setTimeout(resolve, 5));
    }

    expect(delivered).toEqual([
      [0, 10],
      [1, 11],
      [2, 12],
    ]);
    // Each delivered action is closed, so the subscription does not keep the batches of a long-lived flow.
    expect(schedule.mock.results.map(({ value }) => value.closed)).toEqual([true, true, true]);
    subscription.unsubscribe();
  });
});
