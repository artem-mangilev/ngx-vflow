import { createEnvironmentInjector, DestroyRef, EnvironmentInjector, inject } from '@angular/core';

export interface ModelInjector {
  /** The injector for effects of the model, created on first use: most models never need one. */
  get(): EnvironmentInjector;
  destroy(): void;
}

/** Effects follow the model's lifetime, including when it outlives its rendered view. */
export function createModelInjector(): ModelInjector {
  const parent = inject(EnvironmentInjector);
  const flowDestroyRef = inject(DestroyRef);
  let injector: EnvironmentInjector | null = null;

  return {
    get() {
      if (!injector) {
        const created = createEnvironmentInjector([], parent);
        const unregister = flowDestroyRef.onDestroy(() => created.destroy());
        created.get(DestroyRef).onDestroy(unregister);
        injector = created;
      }
      return injector;
    },
    destroy() {
      injector?.destroy();
    },
  };
}
