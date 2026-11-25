import { Subject } from 'rxjs';
import { batchChanges } from './batch-changes';

describe('batchChanges', () => {
  let source: Subject<number[]>;
  let delivered: number[][];

  /** Lets the microtask that ends a pass run. */
  const endPass = () => Promise.resolve();

  function subscribe(delay?: number) {
    return source.pipe(batchChanges(delay)).subscribe((changes) => delivered.push(changes));
  }

  beforeEach(() => {
    vi.useFakeTimers();
    source = new Subject<number[]>();
    delivered = [];
  });

  afterEach(() => vi.useRealTimers());

  it('delivers the changes of one pass as one array', async () => {
    subscribe();

    source.next([1]);
    source.next([2, 3]);
    await endPass();
    vi.advanceTimersByTime(0);

    expect(delivered).toEqual([[1, 2, 3]]);
  });

  it('delivers the changes of separate passes as separate arrays', async () => {
    subscribe();

    for (const pass of [0, 1, 2]) {
      source.next([pass]);
      await endPass();
      vi.advanceTimersByTime(0);
    }

    expect(delivered).toEqual([[0], [1], [2]]);
  });

  it('delivers nothing before the end of the pass', () => {
    subscribe();

    source.next([1]);
    vi.advanceTimersByTime(1000);

    expect(delivered).toEqual([]);
  });

  it('waits for the delay after the pass', async () => {
    subscribe(50);

    source.next([1]);
    await endPass();
    vi.advanceTimersByTime(49);
    expect(delivered).toEqual([]);

    vi.advanceTimersByTime(1);
    expect(delivered).toEqual([[1]]);
  });

  it('does not copy the array of the source', async () => {
    subscribe();
    const changes = [1];

    source.next(changes);
    source.next([2]);
    await endPass();
    vi.advanceTimersByTime(0);

    expect(changes).toEqual([1]);
  });

  it('drops a pending batch when the subscriber leaves', async () => {
    const subscription = subscribe();

    source.next([1]);
    await endPass();
    subscription.unsubscribe();
    vi.advanceTimersByTime(0);

    expect(delivered).toEqual([]);
  });

  it('forwards an error of the source', () => {
    const errors: unknown[] = [];
    source.pipe(batchChanges()).subscribe({ error: (error) => errors.push(error) });

    source.error('failed');

    expect(errors).toEqual(['failed']);
  });

  it('forwards the completion of the source', () => {
    let completed = false;
    source.pipe(batchChanges()).subscribe({ complete: () => (completed = true) });

    source.complete();

    expect(completed).toBe(true);
  });
});
