import { computed, signal } from '@angular/core';
import { entitySnapshot } from './entity-snapshot';

describe('entitySnapshot', () => {
  interface Entity {
    id: string;
    label?: ReturnType<typeof signal<string>>;
  }

  it('reads the properties of the entity', () => {
    const entity: Entity = { id: 'a' };

    expect(entitySnapshot(entity, signal([]))()).toEqual({ id: 'a' });
  });

  it('is a copy, not the entity', () => {
    const entity: Entity = { id: 'a' };

    expect(entitySnapshot(entity, signal([]))()).not.toBe(entity);
  });

  it('sees a property added to the entity once the collection changes', () => {
    const entity: Entity = { id: 'a' };
    const collection = signal<Entity[]>([entity]);
    const snapshot = entitySnapshot(entity, collection);
    expect(snapshot().label).toBeUndefined();

    const label = signal('hello');
    entity.label = label;
    collection.set([entity]);

    expect(snapshot().label).toBe(label);
  });

  it('does not see a property added before the collection changes', () => {
    const entity: Entity = { id: 'a' };
    const snapshot = entitySnapshot(entity, signal<Entity[]>([entity]));
    snapshot();

    entity.label = signal('hello');

    expect(snapshot().label).toBeUndefined();
  });

  it('sees a property removed from the entity once the collection changes', () => {
    const entity: Entity = { id: 'a', label: signal('hello') };
    const collection = signal<Entity[]>([entity]);
    const snapshot = entitySnapshot(entity, collection);
    snapshot();

    delete entity.label;
    collection.set([entity]);

    expect('label' in snapshot()).toBe(false);
  });

  describe('dependents', () => {
    it('do not run again when the collection changes but the properties stay', () => {
      const entity: Entity = { id: 'a' };
      const collection = signal<Entity[]>([entity]);
      const snapshot = entitySnapshot(entity, collection);
      let runs = 0;
      const dependent = computed(() => {
        runs++;
        return snapshot().id;
      });
      dependent();

      collection.set([entity]);
      dependent();

      expect(runs).toBe(1);
    });

    it('run again when a property is added', () => {
      const entity: Entity = { id: 'a' };
      const collection = signal<Entity[]>([entity]);
      const snapshot = entitySnapshot(entity, collection);
      let runs = 0;
      const dependent = computed(() => {
        runs++;
        return snapshot().label;
      });
      dependent();

      entity.label = signal('hello');
      collection.set([entity]);

      expect(dependent()).toBe(entity.label);
      expect(runs).toBe(2);
    });

    it('run again when a property is replaced', () => {
      const first = signal('first');
      const second = signal('second');
      const entity: Entity = { id: 'a', label: first };
      const collection = signal<Entity[]>([entity]);
      const snapshot = entitySnapshot(entity, collection);
      const dependent = computed(() => snapshot().label);
      dependent();

      entity.label = second;
      collection.set([entity]);

      expect(dependent()).toBe(second);
    });
  });
});
