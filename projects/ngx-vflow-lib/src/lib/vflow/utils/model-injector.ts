import { createEnvironmentInjector, DestroyRef, EnvironmentInjector, inject } from '@angular/core';

/** Effects follow the model's lifetime, including when it outlives its rendered view. */
export function createModelInjector() {
  const injector = createEnvironmentInjector([], inject(EnvironmentInjector));
  const unregister = inject(DestroyRef).onDestroy(() => injector.destroy());
  injector.get(DestroyRef).onDestroy(unregister);
  return injector;
}
