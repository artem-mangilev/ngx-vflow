import { Injector, runInInjectionContext } from "@angular/core";

export function InjectionContext(target: any, key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    if (implementsWithInjector(this)) {
      return runInInjectionContext(this.injector, () => originalMethod.apply(this, args))
    } else {
      throw new Error('Class that contains decorated method must extends WithInjectorDirective class')
    }
  };

  // Return the modified descriptor
  return descriptor;
}

export interface WithInjector {
  injector: Injector
}

const implementsWithInjector = (instance: object): instance is WithInjector => {
  return 'injector' in instance && 'get' in (instance.injector as Injector);
}
