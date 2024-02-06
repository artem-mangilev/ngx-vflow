import { Directive, Injector, inject, runInInjectionContext } from "@angular/core";

export function InjectionContext(target: any, key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    if (this instanceof WithInjectorDirective) {
      return runInInjectionContext(this.injector, () => originalMethod.apply(this, args))
    } else {
      throw new Error('Class that contains decorated method must extends WithInjectorDirective class')
    }
  };

  // Return the modified descriptor
  return descriptor;
}

@Directive()
export abstract class WithInjectorDirective {
  public readonly injector = inject(Injector)
}
